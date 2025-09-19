"""
Main coordinator module for orchestrating the research paper generation workflow.
"""

from typing import Dict, List, Any
import asyncio
from utils import Logger, Config

class ResearchCoordinator:
    """Coordinates the research paper generation process."""
    
    def __init__(self):
        self.logger = Logger(__name__)
        self.config = Config()
        self.agents = {}
        
    async def initialize_agents(self):
        """Initialize all required agents."""
        try:
            from agents.retrieval_agent import RetrievalAgent
            from agents.summarizer_agent import SummarizerAgent
            from agents.citation_agent import CitationAgent
            from agents.paper_generator_agent import PaperGeneratorAgent
            from agents.analytics_agent import AnalyticsAgent
            
            self.agents = {
                'retrieval': RetrievalAgent(),
                'summarizer': SummarizerAgent(),
                'citation': CitationAgent(),
                'paper_generator': PaperGeneratorAgent(),
                'analytics': AnalyticsAgent()
            }
            
            self.logger.info("All agents initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize agents: {str(e)}")
            raise
    
    async def generate_research_paper(self, topic: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main workflow for generating a research paper.
        
        Args:
            topic: Research topic
            requirements: Additional requirements for the paper
            
        Returns:
            Generated paper data
        """
        try:
            self.logger.info(f"Starting research paper generation for topic: {topic}")
            
            # Step 1: Retrieve relevant papers
            papers = await self.agents['retrieval'].retrieve_papers(topic, requirements)
            
            # Step 2: Summarize key findings
            summaries = await self.agents['summarizer'].summarize_papers(papers)
            
            # Step 3: Generate citations
            citations = await self.agents['citation'].generate_citations(papers, summaries)
            
            # Step 4: Generate paper draft
            paper_draft = await self.agents['paper_generator'].generate_draft(
                topic, summaries, citations, requirements
            )
            
            # Step 5: Replace citation placeholders with actual citations
            citation_style = requirements.get('citation_style', 'apa')
            paper_draft = await self._replace_citations_in_draft(paper_draft, papers, citation_style)
            
            # Step 6: Generate analytics
            analytics = await self.agents['analytics'].analyze_paper(paper_draft, papers)
            
            result = {
                'topic': topic,
                'paper_draft': paper_draft,
                'citations': citations,
                'analytics': analytics,
                'status': 'completed'
            }
            
            self.logger.info("Research paper generation completed successfully")
            return result
            
        except Exception as e:
            self.logger.error(f"Error in research paper generation: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    async def _replace_citations_in_draft(self, paper_draft: Dict[str, Any], papers: List[Dict[str, Any]], 
                                        citation_style: str) -> Dict[str, Any]:
        """Replace citation placeholders in the paper draft."""
        try:
            # Replace citations in abstract
            if 'abstract' in paper_draft:
                paper_draft['abstract'] = await self.agents['citation'].replace_citation_placeholders(
                    paper_draft['abstract'], papers, citation_style
                )
            
            # Replace citations in sections
            if 'sections' in paper_draft:
                for section_name, section_content in paper_draft['sections'].items():
                    if isinstance(section_content, dict) and 'content' in section_content:
                        paper_draft['sections'][section_name]['content'] = await self.agents['citation'].replace_citation_placeholders(
                            section_content['content'], papers, citation_style
                        )
                    elif isinstance(section_content, str):
                        paper_draft['sections'][section_name] = await self.agents['citation'].replace_citation_placeholders(
                            section_content, papers, citation_style
                        )
            
            return paper_draft
            
        except Exception as e:
            self.logger.error(f"Error replacing citations in draft: {str(e)}")
            return paper_draft

async def main():
    """Main entry point."""
    coordinator = ResearchCoordinator()
    await coordinator.initialize_agents()
    
    # Example usage
    topic = "Machine Learning in Healthcare"
    requirements = {
        'length': 'medium',
        'focus_areas': ['diagnosis', 'treatment'],
        'publication_target': 'journal'
    }
    
    result = await coordinator.generate_research_paper(topic, requirements)
    print(f"Generation result: {result}")

if __name__ == "__main__":
    asyncio.run(main())
