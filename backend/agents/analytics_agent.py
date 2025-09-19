"""
Analytics agent for analyzing research papers and generating insights.
"""

import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import statistics

class AnalyticsAgent:
    """Agent responsible for analyzing research papers and generating insights."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def analyze_paper(self, paper_draft: Dict[str, Any], source_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze the generated paper and provide insights.
        
        Args:
            paper_draft: Generated paper draft
            source_papers: Source papers used for generation
            
        Returns:
            Analytics data and insights
        """
        try:
            self.logger.info("Starting paper analytics")
            
            analytics = {
                'paper_metrics': await self._calculate_paper_metrics(paper_draft),
                'content_analysis': await self._analyze_content(paper_draft),
                'source_analysis': await self._analyze_sources(source_papers),
                'quality_indicators': await self._assess_quality(paper_draft, source_papers),
                'trend_analysis': await self._analyze_trends(source_papers),
                'recommendations': await self._generate_recommendations(paper_draft, source_papers)
            }
            
            self.logger.info("Paper analytics completed successfully")
            return analytics
            
        except Exception as e:
            self.logger.error(f"Error in paper analytics: {str(e)}")
            return {'error': str(e)}
    
    async def _calculate_paper_metrics(self, paper_draft: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate various metrics for the paper."""
        try:
            metrics = {}
            
            # Basic metrics
            word_count = paper_draft.get('metadata', {}).get('word_count', 0)
            sections = paper_draft.get('sections', {})
            abstract = paper_draft.get('abstract', '')
            
            metrics['word_count'] = word_count
            metrics['section_count'] = len(sections)
            metrics['abstract_length'] = len(abstract.split())
            
            # Section length analysis
            section_lengths = {}
            for section_name, content in sections.items():
                if isinstance(content, str):
                    section_lengths[section_name] = len(content.split())
            
            metrics['section_lengths'] = section_lengths
            metrics['average_section_length'] = statistics.mean(section_lengths.values()) if section_lengths else 0
            
            # Readability metrics (simplified)
            metrics['readability_score'] = await self._calculate_readability(paper_draft)
            
            # Citation density
            references_count = len(sections.get('references', '').split('\n')) if 'references' in sections else 0
            metrics['citation_density'] = references_count / max(word_count / 1000, 1)  # Citations per 1000 words
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error calculating paper metrics: {str(e)}")
            return {}
    
    async def _analyze_content(self, paper_draft: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the content of the paper."""
        try:
            content_analysis = {}
            
            # Extract text content
            full_text = paper_draft.get('abstract', '')
            sections = paper_draft.get('sections', {})
            
            for section_content in sections.values():
                if isinstance(section_content, str):
                    full_text += ' ' + section_content
            
            # Keyword analysis
            keywords = await self._extract_keywords(full_text)
            content_analysis['keywords'] = keywords
            
            # Topic modeling (simplified)
            topics = await self._identify_topics(full_text)
            content_analysis['topics'] = topics
            
            # Sentiment analysis (simplified)
            sentiment = await self._analyze_sentiment(full_text)
            content_analysis['sentiment'] = sentiment
            
            # Coherence analysis
            coherence_score = await self._assess_coherence(paper_draft)
            content_analysis['coherence_score'] = coherence_score
            
            # Academic tone assessment
            academic_score = await self._assess_academic_tone(full_text)
            content_analysis['academic_tone_score'] = academic_score
            
            return content_analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing content: {str(e)}")
            return {}
    
    async def _analyze_sources(self, source_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze the source papers used."""
        try:
            source_analysis = {}
            
            if not source_papers:
                return {'error': 'No source papers provided'}
            
            # Basic statistics
            source_analysis['total_sources'] = len(source_papers)
            
            # Publication year analysis
            years = [paper.get('year', 0) for paper in source_papers if paper.get('year')]
            if years:
                source_analysis['publication_years'] = {
                    'earliest': min(years),
                    'latest': max(years),
                    'average': statistics.mean(years),
                    'median': statistics.median(years)
                }
            
            # Source diversity
            journals = set(paper.get('journal', '') for paper in source_papers if paper.get('journal'))
            authors = set()
            for paper in source_papers:
                authors.update(paper.get('authors', []))
            
            source_analysis['journal_diversity'] = len(journals)
            source_analysis['author_diversity'] = len(authors)
            
            # Citation impact
            citation_counts = [paper.get('citations_count', 0) for paper in source_papers]
            if citation_counts:
                source_analysis['citation_impact'] = {
                    'total_citations': sum(citation_counts),
                    'average_citations': statistics.mean(citation_counts),
                    'median_citations': statistics.median(citation_counts),
                    'max_citations': max(citation_counts)
                }
            
            # Relevance scores
            relevance_scores = [paper.get('relevance_score', 0) for paper in source_papers]
            if relevance_scores:
                source_analysis['relevance_analysis'] = {
                    'average_relevance': statistics.mean(relevance_scores),
                    'median_relevance': statistics.median(relevance_scores),
                    'high_relevance_count': len([s for s in relevance_scores if s > 0.7])
                }
            
            return source_analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing sources: {str(e)}")
            return {}
    
    async def _assess_quality(self, paper_draft: Dict[str, Any], source_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess the quality of the generated paper."""
        try:
            quality_indicators = {}
            
            # Content quality
            quality_indicators['content_completeness'] = await self._assess_completeness(paper_draft)
            quality_indicators['logical_flow'] = await self._assess_logical_flow(paper_draft)
            quality_indicators['evidence_strength'] = await self._assess_evidence_strength(paper_draft, source_papers)
            
            # Academic standards
            quality_indicators['academic_rigor'] = await self._assess_academic_rigor(paper_draft)
            quality_indicators['citation_quality'] = await self._assess_citation_quality(source_papers)
            
            # Overall quality score
            scores = [
                quality_indicators.get('content_completeness', 0),
                quality_indicators.get('logical_flow', 0),
                quality_indicators.get('evidence_strength', 0),
                quality_indicators.get('academic_rigor', 0),
                quality_indicators.get('citation_quality', 0)
            ]
            
            quality_indicators['overall_quality_score'] = statistics.mean(scores) if scores else 0
            
            return quality_indicators
            
        except Exception as e:
            self.logger.error(f"Error assessing quality: {str(e)}")
            return {}
    
    async def _analyze_trends(self, source_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trends in the source papers."""
        try:
            trend_analysis = {}
            
            if not source_papers:
                return {'error': 'No source papers for trend analysis'}
            
            # Temporal trends
            years = [paper.get('year', 0) for paper in source_papers if paper.get('year')]
            if years:
                year_counts = {}
                for year in years:
                    year_counts[year] = year_counts.get(year, 0) + 1
                
                trend_analysis['publication_trends'] = {
                    'year_distribution': year_counts,
                    'growth_rate': await self._calculate_growth_rate(years),
                    'recent_activity': len([y for y in years if y >= 2020])
                }
            
            # Methodological trends
            methodologies = []
            for paper in source_papers:
                abstract = paper.get('abstract', '').lower()
                if 'experiment' in abstract:
                    methodologies.append('experimental')
                elif 'computational' in abstract or 'model' in abstract:
                    methodologies.append('computational')
                elif 'review' in abstract or 'survey' in abstract:
                    methodologies.append('review')
                else:
                    methodologies.append('other')
            
            methodology_counts = {}
            for method in methodologies:
                methodology_counts[method] = methodology_counts.get(method, 0) + 1
            
            trend_analysis['methodological_trends'] = methodology_counts
            
            # Topic trends
            topics = []
            for paper in source_papers:
                keywords = paper.get('keywords', [])
                topics.extend(keywords[:3])  # Take top 3 keywords per paper
            
            topic_counts = {}
            for topic in topics:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
            
            # Get top topics
            top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            trend_analysis['topic_trends'] = dict(top_topics)
            
            return trend_analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing trends: {str(e)}")
            return {}
    
    async def _generate_recommendations(self, paper_draft: Dict[str, Any], source_papers: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations for improving the paper."""
        try:
            recommendations = []
            
            # Word count recommendations
            word_count = paper_draft.get('metadata', {}).get('word_count', 0)
            if word_count < 3000:
                recommendations.append("Consider expanding the paper to meet typical academic length requirements (3000+ words)")
            elif word_count > 10000:
                recommendations.append("Consider condensing the paper to improve readability and focus")
            
            # Section analysis
            sections = paper_draft.get('sections', {})
            if 'methodology' not in sections:
                recommendations.append("Add a methodology section to describe the research approach")
            
            if 'results' not in sections:
                recommendations.append("Include a results section to present findings")
            
            # Source quality
            high_relevance_count = len([p for p in source_papers if p.get('relevance_score', 0) > 0.7])
            if high_relevance_count < len(source_papers) * 0.5:
                recommendations.append("Consider including more highly relevant sources")
            
            # Recent sources
            recent_sources = len([p for p in source_papers if p.get('year', 0) >= 2020])
            if recent_sources < len(source_papers) * 0.3:
                recommendations.append("Include more recent sources to ensure current relevance")
            
            # Citation density
            references_section = sections.get('references', '')
            citation_count = len(references_section.split('\n')) if references_section else 0
            citation_density = citation_count / max(word_count / 1000, 1)
            
            if citation_density < 10:
                recommendations.append("Increase citation density - aim for 10+ citations per 1000 words")
            elif citation_density > 50:
                recommendations.append("Consider reducing citation density for better readability")
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {str(e)}")
            return ["Error generating recommendations"]
    
    # Helper methods for analysis
    async def _calculate_readability(self, paper_draft: Dict[str, Any]) -> float:
        """Calculate a simplified readability score."""
        # Simplified Flesch Reading Ease approximation
        full_text = paper_draft.get('abstract', '')
        sections = paper_draft.get('sections', {})
        
        for section_content in sections.values():
            if isinstance(section_content, str):
                full_text += ' ' + section_content
        
        words = full_text.split()
        sentences = full_text.split('.')
        
        if len(sentences) == 0 or len(words) == 0:
            return 0.5
        
        avg_sentence_length = len(words) / len(sentences)
        
        # Simple approximation: shorter sentences = higher readability
        if avg_sentence_length <= 15:
            return 0.8
        elif avg_sentence_length <= 20:
            return 0.6
        else:
            return 0.4
    
    async def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text."""
        # Simple keyword extraction
        words = text.lower().split()
        
        # Filter common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'}
        
        filtered_words = [word for word in words if word not in stop_words and len(word) > 3]
        
        # Count word frequency
        word_counts = {}
        for word in filtered_words:
            word_counts[word] = word_counts.get(word, 0) + 1
        
        # Return top keywords
        top_keywords = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        return [keyword for keyword, count in top_keywords]
    
    async def _identify_topics(self, text: str) -> List[str]:
        """Identify topics in the text."""
        # Simplified topic identification
        topics = []
        
        if 'machine learning' in text.lower():
            topics.append('Machine Learning')
        if 'artificial intelligence' in text.lower():
            topics.append('Artificial Intelligence')
        if 'healthcare' in text.lower():
            topics.append('Healthcare')
        if 'data analysis' in text.lower():
            topics.append('Data Analysis')
        
        return topics
    
    async def _analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of the text."""
        # Simplified sentiment analysis
        positive_words = ['good', 'great', 'excellent', 'positive', 'success', 'improve', 'benefit', 'effective']
        negative_words = ['bad', 'poor', 'negative', 'failure', 'problem', 'issue', 'limitation', 'weak']
        
        words = text.lower().split()
        
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        total_words = len(words)
        
        if total_words == 0:
            return {'positive': 0.5, 'negative': 0.5, 'neutral': 0.5}
        
        positive_score = positive_count / total_words
        negative_score = negative_count / total_words
        neutral_score = 1 - positive_score - negative_score
        
        return {
            'positive': positive_score,
            'negative': negative_score,
            'neutral': max(neutral_score, 0)
        }
    
    async def _assess_coherence(self, paper_draft: Dict[str, Any]) -> float:
        """Assess the coherence of the paper."""
        # Simplified coherence assessment
        sections = paper_draft.get('sections', {})
        
        # Check if sections flow logically
        expected_sections = ['introduction', 'literature_review', 'methodology', 'results', 'discussion', 'conclusion']
        present_sections = [s for s in expected_sections if s in sections]
        
        # Basic coherence score based on section presence
        coherence_score = len(present_sections) / len(expected_sections)
        
        return coherence_score
    
    async def _assess_academic_tone(self, text: str) -> float:
        """Assess the academic tone of the text."""
        # Simplified academic tone assessment
        academic_words = ['research', 'study', 'analysis', 'findings', 'results', 'conclusion', 'methodology', 'literature', 'review', 'investigation']
        
        words = text.lower().split()
        academic_word_count = sum(1 for word in words if word in academic_words)
        
        if len(words) == 0:
            return 0.5
        
        return min(academic_word_count / len(words) * 10, 1.0)
    
    async def _assess_completeness(self, paper_draft: Dict[str, Any]) -> float:
        """Assess the completeness of the paper."""
        expected_sections = ['abstract', 'introduction', 'literature_review', 'methodology', 'results', 'discussion', 'conclusion', 'references']
        sections = paper_draft.get('sections', {})
        
        # Check abstract
        abstract_score = 1.0 if paper_draft.get('abstract') else 0.0
        
        # Check sections
        section_score = len([s for s in expected_sections[1:] if s in sections]) / (len(expected_sections) - 1)
        
        return (abstract_score + section_score) / 2
    
    async def _assess_logical_flow(self, paper_draft: Dict[str, Any]) -> float:
        """Assess the logical flow of the paper."""
        # Simplified logical flow assessment
        sections = paper_draft.get('sections', {})
        
        # Check for logical progression
        flow_indicators = 0
        
        if 'introduction' in sections and 'conclusion' in sections:
            flow_indicators += 1
        
        if 'literature_review' in sections and 'methodology' in sections:
            flow_indicators += 1
        
        if 'results' in sections and 'discussion' in sections:
            flow_indicators += 1
        
        return flow_indicators / 3
    
    async def _assess_evidence_strength(self, paper_draft: Dict[str, Any], source_papers: List[Dict[str, Any]]) -> float:
        """Assess the strength of evidence."""
        if not source_papers:
            return 0.0
        
        # Based on number of sources and their relevance
        high_relevance_count = len([p for p in source_papers if p.get('relevance_score', 0) > 0.7])
        total_sources = len(source_papers)
        
        return high_relevance_count / total_sources if total_sources > 0 else 0.0
    
    async def _assess_academic_rigor(self, paper_draft: Dict[str, Any]) -> float:
        """Assess the academic rigor of the paper."""
        # Simplified academic rigor assessment
        sections = paper_draft.get('sections', {})
        
        rigor_indicators = 0
        
        # Check for methodology section
        if 'methodology' in sections:
            rigor_indicators += 1
        
        # Check for references section
        if 'references' in sections:
            rigor_indicators += 1
        
        # Check for discussion of limitations
        discussion = sections.get('discussion', '')
        if 'limitation' in discussion.lower():
            rigor_indicators += 1
        
        return rigor_indicators / 3
    
    async def _assess_citation_quality(self, source_papers: List[Dict[str, Any]]) -> float:
        """Assess the quality of citations."""
        if not source_papers:
            return 0.0
        
        # Based on source diversity and relevance
        journals = set(paper.get('journal', '') for paper in source_papers if paper.get('journal'))
        authors = set()
        for paper in source_papers:
            authors.update(paper.get('authors', []))
        
        diversity_score = min(len(journals) / 10, 1.0) * 0.5 + min(len(authors) / 20, 1.0) * 0.5
        
        relevance_scores = [paper.get('relevance_score', 0) for paper in source_papers]
        avg_relevance = statistics.mean(relevance_scores) if relevance_scores else 0
        
        return (diversity_score + avg_relevance) / 2
    
    async def _calculate_growth_rate(self, years: List[int]) -> float:
        """Calculate the growth rate of publications."""
        if len(years) < 2:
            return 0.0
        
        # Simple growth rate calculation
        earliest = min(years)
        latest = max(years)
        
        if earliest == latest:
            return 0.0
        
        # Count publications in first half vs second half
        mid_point = earliest + (latest - earliest) / 2
        early_count = len([y for y in years if y <= mid_point])
        late_count = len([y for y in years if y > mid_point])
        
        if early_count == 0:
            return 1.0
        
        return (late_count - early_count) / early_count
