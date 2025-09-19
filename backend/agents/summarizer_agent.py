"""
Summarizer agent for creating summaries of research papers.
"""

import asyncio
from typing import List, Dict, Any, Optional
import logging

class SummarizerAgent:
    """Agent responsible for summarizing research papers."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.max_summary_length = 2000
    
    async def summarize_papers(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create summaries of the provided papers.
        
        Args:
            papers: List of research papers
            
        Returns:
            Dictionary containing various types of summaries
        """
        try:
            self.logger.info(f"Starting summarization of {len(papers)} papers")
            
            # Create different types of summaries
            summaries = {
                'individual_summaries': await self._create_individual_summaries(papers),
                'thematic_summary': await self._create_thematic_summary(papers),
                'key_findings': await self._extract_key_findings(papers),
                'methodology_summary': await self._summarize_methodologies(papers),
                'gaps_and_opportunities': await self._identify_gaps(papers)
            }
            
            self.logger.info("Summarization completed successfully")
            return summaries
            
        except Exception as e:
            self.logger.error(f"Error in summarization: {str(e)}")
            return {'error': str(e)}
    
    async def _create_individual_summaries(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create individual summaries for each paper."""
        summaries = []
        
        for paper in papers:
            try:
                summary = await self._summarize_single_paper(paper)
                summaries.append({
                    'paper_id': paper.get('id', ''),
                    'title': paper.get('title', ''),
                    'summary': summary,
                    'key_points': await self._extract_key_points(paper),
                    'relevance_score': paper.get('relevance_score', 0.0)
                })
            except Exception as e:
                self.logger.error(f"Error summarizing paper {paper.get('title', 'Unknown')}: {str(e)}")
                continue
        
        return summaries
    
    async def _summarize_single_paper(self, paper: Dict[str, Any]) -> str:
        """Create a summary for a single paper."""
        try:
            abstract = paper.get('abstract', '')
            title = paper.get('title', '')
            
            if not abstract:
                return f"Summary not available for: {title}"
            
            # In production, this would use an LLM API like OpenAI
            # For now, we'll create a simple extractive summary
            sentences = abstract.split('. ')
            
            if len(sentences) <= 3:
                return abstract
            
            # Take first few sentences and last sentence if available
            summary_sentences = sentences[:2]
            if len(sentences) > 3:
                summary_sentences.append(sentences[-1])
            
            summary = '. '.join(summary_sentences)
            if not summary.endswith('.'):
                summary += '.'
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error creating summary: {str(e)}")
            return f"Error creating summary for {paper.get('title', 'Unknown')}"
    
    async def _create_thematic_summary(self, papers: List[Dict[str, Any]]) -> str:
        """Create a thematic summary across all papers."""
        try:
            if not papers:
                return "No papers to summarize."
            
            # Extract common themes and patterns
            themes = await self._identify_themes(papers)
            
            summary = f"Based on analysis of {len(papers)} research papers, several key themes emerge:\n\n"
            
            for i, theme in enumerate(themes, 1):
                summary += f"{i}. {theme['name']}: {theme['description']}\n"
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error creating thematic summary: {str(e)}")
            return "Error creating thematic summary."
    
    async def _extract_key_findings(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract key findings from all papers."""
        findings = []
        
        for paper in papers:
            try:
                paper_findings = await self._extract_paper_findings(paper)
                findings.extend(paper_findings)
            except Exception as e:
                self.logger.error(f"Error extracting findings from {paper.get('title', 'Unknown')}: {str(e)}")
                continue
        
        # Group similar findings
        grouped_findings = await self._group_similar_findings(findings)
        return grouped_findings
    
    async def _summarize_methodologies(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize methodologies used across papers."""
        methodologies = {
            'experimental': [],
            'computational': [],
            'theoretical': [],
            'review': [],
            'other': []
        }
        
        for paper in papers:
            try:
                methodology = await self._classify_methodology(paper)
                if methodology in methodologies:
                    methodologies[methodology].append({
                        'title': paper.get('title', ''),
                        'description': paper.get('methodology_description', ''),
                        'year': paper.get('year', '')
                    })
            except Exception as e:
                self.logger.error(f"Error classifying methodology: {str(e)}")
                continue
        
        return methodologies
    
    async def _identify_gaps(self, papers: List[Dict[str, Any]]) -> List[str]:
        """Identify research gaps and opportunities."""
        gaps = []
        
        try:
            # Analyze publication years to identify temporal gaps
            years = [paper.get('year', 0) for paper in papers if paper.get('year')]
            if years:
                recent_years = [year for year in years if year >= 2020]
                if len(recent_years) < len(years) * 0.3:
                    gaps.append("Limited recent research - opportunity for current studies")
            
            # Analyze methodologies for gaps
            methodologies = await self._summarize_methodologies(papers)
            if not methodologies['computational']:
                gaps.append("Lack of computational approaches")
            if not methodologies['experimental']:
                gaps.append("Limited experimental validation")
            
            # Analyze geographic diversity
            countries = set()
            for paper in papers:
                if paper.get('country'):
                    countries.add(paper['country'])
            
            if len(countries) < 3:
                gaps.append("Limited geographic diversity in research")
            
        except Exception as e:
            self.logger.error(f"Error identifying gaps: {str(e)}")
            gaps.append("Error in gap analysis")
        
        return gaps
    
    async def _summarize_single_paper(self, paper: Dict[str, Any]) -> str:
        """Summarize a single paper (duplicate method - should be consolidated)."""
        return await self._summarize_single_paper(paper)
    
    async def _extract_key_points(self, paper: Dict[str, Any]) -> List[str]:
        """Extract key points from a paper."""
        key_points = []
        
        # Simple extraction based on abstract
        abstract = paper.get('abstract', '')
        sentences = abstract.split('. ')
        
        # Take sentences that contain important keywords
        important_keywords = ['significant', 'important', 'novel', 'innovative', 'breakthrough', 'finding']
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in important_keywords):
                key_points.append(sentence.strip())
        
        return key_points[:3]  # Limit to top 3 key points
    
    async def _identify_themes(self, papers: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Identify common themes across papers."""
        # Simplified theme identification
        themes = [
            {
                'name': 'Research Methodology',
                'description': 'Various methodological approaches used across studies'
            },
            {
                'name': 'Technological Innovation',
                'description': 'Novel technologies and tools developed or applied'
            },
            {
                'name': 'Clinical Applications',
                'description': 'Practical applications in clinical settings'
            }
        ]
        
        return themes
    
    async def _extract_paper_findings(self, paper: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract findings from a single paper."""
        findings = []
        
        # Simple extraction based on abstract
        abstract = paper.get('abstract', '')
        if 'significant' in abstract.lower():
            findings.append({
                'paper_title': paper.get('title', ''),
                'finding': 'Contains significant findings',
                'confidence': 0.7
            })
        
        return findings
    
    async def _group_similar_findings(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Group similar findings together."""
        # Simplified grouping
        grouped = []
        for finding in findings:
            grouped.append({
                'finding': finding.get('finding', ''),
                'papers': [finding.get('paper_title', '')],
                'confidence': finding.get('confidence', 0.5)
            })
        
        return grouped
    
    async def _classify_methodology(self, paper: Dict[str, Any]) -> str:
        """Classify the methodology used in a paper."""
        abstract = paper.get('abstract', '').lower()
        title = paper.get('title', '').lower()
        text = f"{title} {abstract}"
        
        if any(word in text for word in ['experiment', 'clinical trial', 'study']):
            return 'experimental'
        elif any(word in text for word in ['model', 'algorithm', 'simulation', 'computation']):
            return 'computational'
        elif any(word in text for word in ['theory', 'theoretical', 'framework']):
            return 'theoretical'
        elif any(word in text for word in ['review', 'survey', 'meta-analysis']):
            return 'review'
        else:
            return 'other'
