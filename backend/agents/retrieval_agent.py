"""
Retrieval agent for finding relevant research papers from various sources.
"""

import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import json
import os
from dataclasses import dataclass

@dataclass
class PaperMetadata:
    """Structured paper metadata."""
    title: str
    authors: List[str]
    year: int
    doi: Optional[str]
    abstract: str
    journal: str
    url: str
    citation_count: int = 0
    relevance_score: float = 0.0
    source: str = ""

class RetrievalAgent:
    """Agent responsible for retrieving research papers from various sources."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.api_keys = {
            'semantic_scholar': os.getenv('SEMANTIC_SCHOLAR_API_KEY', ''),
            'pubmed': os.getenv('PUBMED_API_KEY', ''),
            'scopus': os.getenv('SCOPUS_API_KEY', '')
        }
        self.sources = {
            'semantic_scholar': self._search_semantic_scholar,
            'crossref': self._search_crossref,
            'openalex': self._search_openalex,
            'pubmed': self._search_pubmed,
            'arxiv': self._search_arxiv
        }
    
    async def retrieve_papers(self, topic: str, requirements: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Retrieve relevant papers for the given topic.
        
        Args:
            topic: Research topic
            requirements: Additional requirements
            
        Returns:
            List of relevant papers
        """
        try:
            self.logger.info(f"Starting paper retrieval for topic: {topic}")
            
            # Determine which sources to use
            sources_to_search = requirements.get('sources', list(self.sources.keys()))
            max_papers = requirements.get('max_papers', 50)
            
            # Search all sources concurrently
            tasks = []
            for source in sources_to_search:
                if source in self.sources:
                    task = self.sources[source](topic, max_papers // len(sources_to_search))
                    tasks.append(task)
            
            # Wait for all searches to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine and deduplicate results
            all_papers = []
            for result in results:
                if isinstance(result, list):
                    all_papers.extend(result)
                elif isinstance(result, Exception):
                    self.logger.error(f"Error in paper retrieval: {result}")
            
            # Remove duplicates and sort by relevance
            unique_papers = self._deduplicate_papers(all_papers)
            scored_papers = self._score_papers(unique_papers, topic)
            
            # Return top papers
            final_papers = sorted(scored_papers, key=lambda x: x['relevance_score'], reverse=True)[:max_papers]
            
            self.logger.info(f"Retrieved {len(final_papers)} relevant papers")
            return final_papers
            
        except Exception as e:
            self.logger.error(f"Error in paper retrieval: {str(e)}")
            return []
    
    async def _search_semantic_scholar(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search Semantic Scholar API for papers."""
        try:
            headers = {}
            if self.api_keys['semantic_scholar']:
                headers['x-api-key'] = self.api_keys['semantic_scholar']
            
            async with aiohttp.ClientSession(headers=headers) as session:
                url = "https://api.semanticscholar.org/graph/v1/paper/search"
                params = {
                    'query': topic,
                    'limit': min(max_results, 100),
                    'fields': 'paperId,title,authors,year,abstract,venue,url,openAccessPdf,citationCount,referenceCount'
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        papers = []
                        for paper_data in data.get('data', []):
                            paper = self._parse_semantic_scholar_paper(paper_data)
                            if paper:
                                papers.append(paper)
                        return papers
                    else:
                        self.logger.warning(f"Semantic Scholar API returned status {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error searching Semantic Scholar: {str(e)}")
            return []

    async def _search_crossref(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search CrossRef API for papers."""
        try:
            async with aiohttp.ClientSession() as session:
                url = "https://api.crossref.org/works"
                params = {
                    'query': topic,
                    'rows': min(max_results, 100),
                    'mailto': 'research@mit.edu'  # Polite API usage
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        papers = []
                        for item in data.get('message', {}).get('items', []):
                            paper = self._parse_crossref_paper(item)
                            if paper:
                                papers.append(paper)
                        return papers
                    else:
                        self.logger.warning(f"CrossRef API returned status {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error searching CrossRef: {str(e)}")
            return []

    async def _search_openalex(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search OpenAlex API for papers."""
        try:
            async with aiohttp.ClientSession() as session:
                url = "https://api.openalex.org/works"
                params = {
                    'search': topic,
                    'per-page': min(max_results, 200),
                    'mailto': 'research@mit.edu'
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        papers = []
                        for item in data.get('results', []):
                            paper = self._parse_openalex_paper(item)
                            if paper:
                                papers.append(paper)
                        return papers
                    else:
                        self.logger.warning(f"OpenAlex API returned status {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error searching OpenAlex: {str(e)}")
            return []

    async def _search_pubmed(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search PubMed API for papers."""
        try:
            async with aiohttp.ClientSession() as session:
                # Step 1: Search for PMIDs
                search_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
                search_params = {
                    'db': 'pubmed',
                    'term': topic,
                    'retmax': min(max_results, 100),
                    'retmode': 'json',
                    'sort': 'relevance'
                }
                
                async with session.get(search_url, params=search_params) as response:
                    if response.status == 200:
                        search_data = await response.json()
                        pmids = search_data.get('esearchresult', {}).get('idlist', [])
                        
                        if pmids:
                            # Step 2: Fetch detailed information
                            fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
                            fetch_params = {
                                'db': 'pubmed',
                                'id': ','.join(pmids[:max_results]),
                                'retmode': 'xml'
                            }
                            
                            async with session.get(fetch_url, params=fetch_params) as fetch_response:
                                if fetch_response.status == 200:
                                    xml_content = await fetch_response.text()
                                    return self._parse_pubmed_xml(xml_content)
                        return []
                    else:
                        self.logger.warning(f"PubMed API returned status {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error searching PubMed: {str(e)}")
            return []

    async def _search_arxiv(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search arXiv for papers."""
        try:
            async with aiohttp.ClientSession() as session:
                url = "http://export.arxiv.org/api/query"
                params = {
                    'search_query': f'all:{topic}',
                    'start': 0,
                    'max_results': min(max_results, 100),
                    'sortBy': 'relevance',
                    'sortOrder': 'descending'
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        xml_content = await response.text()
                        return self._parse_arxiv_xml(xml_content)
                    else:
                        self.logger.warning(f"arXiv API returned status {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error searching arXiv: {str(e)}")
            return []
    
    async def _search_pubmed(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search PubMed for papers."""
        try:
            async with aiohttp.ClientSession() as session:
                url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
                params = {
                    'db': 'pubmed',
                    'term': topic,
                    'retmax': max_results,
                    'retmode': 'json',
                    'sort': 'relevance'
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        ids = data.get('esearchresult', {}).get('idlist', [])
                        
                        if ids:
                            return await self._fetch_pubmed_details(session, ids[:max_results])
                        return []
                    else:
                        self.logger.warning(f"PubMed API returned status {response.status}")
                        return []
                        
        except Exception as e:
            self.logger.error(f"Error searching PubMed: {str(e)}")
            return []
    
    async def _search_google_scholar(self, topic: str, max_results: int) -> List[Dict[str, Any]]:
        """Search Google Scholar for papers."""
        # Note: This is a simplified implementation
        # In production, you'd need to use a proper Google Scholar API or scraping service
        try:
            self.logger.info("Google Scholar search not implemented - returning empty results")
            return []
        except Exception as e:
            self.logger.error(f"Error searching Google Scholar: {str(e)}")
            return []
    
    async def _fetch_pubmed_details(self, session: aiohttp.ClientSession, ids: List[str]) -> List[Dict[str, Any]]:
        """Fetch detailed information for PubMed papers."""
        try:
            url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
            params = {
                'db': 'pubmed',
                'id': ','.join(ids),
                'retmode': 'xml'
            }
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    xml_content = await response.text()
                    return self._parse_pubmed_xml(xml_content)
                return []
                
        except Exception as e:
            self.logger.error(f"Error fetching PubMed details: {str(e)}")
            return []
    
    def _parse_semantic_scholar_paper(self, paper_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse Semantic Scholar paper data."""
        try:
            authors = [author.get('name', '') for author in paper_data.get('authors', [])]
            
            return {
                'title': paper_data.get('title', ''),
                'authors': authors,
                'year': paper_data.get('year', 0),
                'doi': None,  # Semantic Scholar doesn't always provide DOI
                'abstract': paper_data.get('abstract', ''),
                'journal': paper_data.get('venue', ''),
                'url': paper_data.get('url', ''),
                'citations_count': paper_data.get('citationCount', 0),
                'source': 'semantic_scholar',
                'paper_id': paper_data.get('paperId', ''),
                'open_access_pdf': paper_data.get('openAccessPdf', {}).get('url', '')
            }
        except Exception as e:
            self.logger.error(f"Error parsing Semantic Scholar paper: {str(e)}")
            return None

    def _parse_crossref_paper(self, paper_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse CrossRef paper data."""
        try:
            authors = []
            for author in paper_data.get('author', []):
                given = author.get('given', '')
                family = author.get('family', '')
                if given and family:
                    authors.append(f"{given} {family}")
                elif family:
                    authors.append(family)
            
            doi = None
            for identifier in paper_data.get('link', []):
                if identifier.get('intended-application') == 'text-mining':
                    doi = identifier.get('URL', '').replace('https://dx.doi.org/', '')
                    break
            
            if not doi:
                doi = paper_data.get('DOI', '')
            
            return {
                'title': paper_data.get('title', [''])[0] if paper_data.get('title') else '',
                'authors': authors,
                'year': paper_data.get('published-print', {}).get('date-parts', [[0]])[0][0],
                'doi': doi,
                'abstract': '',  # CrossRef doesn't always provide abstracts
                'journal': paper_data.get('container-title', [''])[0] if paper_data.get('container-title') else '',
                'url': paper_data.get('URL', ''),
                'citations_count': paper_data.get('is-referenced-by-count', 0),
                'source': 'crossref'
            }
        except Exception as e:
            self.logger.error(f"Error parsing CrossRef paper: {str(e)}")
            return None

    def _parse_openalex_paper(self, paper_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse OpenAlex paper data."""
        try:
            authors = []
            for author in paper_data.get('authorships', []):
                author_name = author.get('author', {}).get('display_name', '')
                if author_name:
                    authors.append(author_name)
            
            # Extract DOI from external IDs
            doi = None
            for external_id in paper_data.get('ids', {}):
                if external_id == 'doi':
                    doi = paper_data['ids'][external_id].replace('https://doi.org/', '')
                    break
            
            return {
                'title': paper_data.get('title', ''),
                'authors': authors,
                'year': paper_data.get('publication_year', 0),
                'doi': doi,
                'abstract': paper_data.get('abstract_inverted_index', ''),
                'journal': paper_data.get('primary_location', {}).get('source', {}).get('display_name', ''),
                'url': paper_data.get('id', '').replace('https://openalex.org/', 'https://doi.org/'),
                'citations_count': paper_data.get('cited_by_count', 0),
                'source': 'openalex'
            }
        except Exception as e:
            self.logger.error(f"Error parsing OpenAlex paper: {str(e)}")
            return None

    def _parse_pubmed_xml(self, xml_content: str) -> List[Dict[str, Any]]:
        """Parse PubMed XML response."""
        papers = []
        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_content)
            
            for article in root.findall('.//PubmedArticle'):
                try:
                    # Extract title
                    title_elem = article.find('.//ArticleTitle')
                    title = title_elem.text if title_elem is not None else ''
                    
                    # Extract authors
                    authors = []
                    for author in article.findall('.//Author'):
                        last_name = author.find('LastName')
                        first_name = author.find('ForeName')
                        if last_name is not None:
                            author_name = last_name.text
                            if first_name is not None:
                                author_name = f"{first_name.text} {author_name}"
                            authors.append(author_name)
                    
                    # Extract abstract
                    abstract_elem = article.find('.//AbstractText')
                    abstract = abstract_elem.text if abstract_elem is not None else ''
                    
                    # Extract journal
                    journal_elem = article.find('.//Journal/Title')
                    journal = journal_elem.text if journal_elem is not None else ''
                    
                    # Extract year
                    year_elem = article.find('.//PubDate/Year')
                    year = int(year_elem.text) if year_elem is not None and year_elem.text else 0
                    
                    # Extract PMID
                    pmid_elem = article.find('.//PMID')
                    pmid = pmid_elem.text if pmid_elem is not None else ''
                    
                    papers.append({
                        'title': title,
                        'authors': authors,
                        'year': year,
                        'doi': None,  # PubMed doesn't always have DOI
                        'abstract': abstract,
                        'journal': journal,
                        'url': f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
                        'citations_count': 0,  # Would need separate API call
                        'source': 'pubmed',
                        'pmid': pmid
                    })
                except Exception as e:
                    self.logger.error(f"Error parsing individual PubMed article: {str(e)}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error parsing PubMed XML: {str(e)}")
        
        return papers

    def _parse_arxiv_xml(self, xml_content: str) -> List[Dict[str, Any]]:
        """Parse arXiv XML response."""
        papers = []
        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_content)
            
            for entry in root.findall('{http://www.w3.org/2005/Atom}entry'):
                try:
                    # Extract title
                    title_elem = entry.find('{http://www.w3.org/2005/Atom}title')
                    title = title_elem.text if title_elem is not None else ''
                    
                    # Extract authors
                    authors = []
                    for author in entry.findall('{http://www.w3.org/2005/Atom}author'):
                        name_elem = author.find('{http://www.w3.org/2005/Atom}name')
                        if name_elem is not None:
                            authors.append(name_elem.text)
                    
                    # Extract abstract
                    abstract_elem = entry.find('{http://www.w3.org/2005/Atom}summary')
                    abstract = abstract_elem.text if abstract_elem is not None else ''
                    
                    # Extract published date
                    published_elem = entry.find('{http://www.w3.org/2005/Atom}published')
                    year = 0
                    if published_elem is not None:
                        year = int(published_elem.text[:4])
                    
                    # Extract arXiv ID
                    arxiv_id = entry.find('{http://www.w3.org/2005/Atom}id').text if entry.find('{http://www.w3.org/2005/Atom}id') is not None else ''
                    
                    papers.append({
                        'title': title,
                        'authors': authors,
                        'year': year,
                        'doi': None,  # arXiv papers don't have DOI initially
                        'abstract': abstract,
                        'journal': 'arXiv',
                        'url': arxiv_id,
                        'citations_count': 0,  # Would need separate API call
                        'source': 'arxiv',
                        'arxiv_id': arxiv_id.split('/')[-1] if arxiv_id else ''
                    })
                except Exception as e:
                    self.logger.error(f"Error parsing individual arXiv entry: {str(e)}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error parsing arXiv XML: {str(e)}")
        
        return papers
    
    def _deduplicate_papers(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate papers based on title and authors."""
        seen = set()
        unique_papers = []
        
        for paper in papers:
            # Create a unique identifier based on title and first author
            title = paper.get('title', '').lower().strip()
            first_author = paper.get('authors', [''])[0].lower().strip() if paper.get('authors') else ''
            identifier = f"{title}_{first_author}"
            
            if identifier not in seen:
                seen.add(identifier)
                unique_papers.append(paper)
        
        return unique_papers
    
    def _score_papers(self, papers: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:
        """Score papers based on relevance to the topic."""
        topic_words = set(topic.lower().split())
        
        for paper in papers:
            score = 0.0
            
            # Score based on title
            title = paper.get('title', '').lower()
            title_matches = sum(1 for word in topic_words if word in title)
            score += (title_matches / len(topic_words)) * 0.4
            
            # Score based on abstract
            abstract = paper.get('abstract', '').lower()
            abstract_matches = sum(1 for word in topic_words if word in abstract)
            score += (abstract_matches / len(topic_words)) * 0.3
            
            # Score based on keywords
            keywords = paper.get('keywords', [])
            keyword_matches = sum(1 for keyword in keywords if any(word in keyword.lower() for word in topic_words))
            score += (keyword_matches / max(len(keywords), 1)) * 0.3
            
            paper['relevance_score'] = min(score, 1.0)
        
        return papers
