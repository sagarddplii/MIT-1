"""
Paper generator agent for creating research paper drafts.
"""

import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import os
import json
import re
from openai import AsyncOpenAI

class PaperGeneratorAgent:
    """Agent responsible for generating research paper drafts."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.openai_client = AsyncOpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.llm_model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
        self.sections = {
            'abstract': self._generate_abstract,
            'introduction': self._generate_introduction,
            'literature_review': self._generate_literature_review,
            'methodology': self._generate_methodology,
            'results': self._generate_results,
            'discussion': self._generate_discussion,
            'conclusion': self._generate_conclusion,
            'references': self._generate_references
        }
    
    async def generate_draft(self, topic: str, summaries: Dict[str, Any], 
                           citations: Dict[str, Any], requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a complete research paper draft.
        
        Args:
            topic: Research topic
            summaries: Paper summaries
            citations: Citation data
            requirements: Paper requirements
            
        Returns:
            Complete paper draft
        """
        try:
            self.logger.info(f"Starting paper generation for topic: {topic}")
            
            # Determine paper structure based on requirements
            paper_structure = self._determine_paper_structure(requirements)
            
            # Generate each section
            paper_draft = {
                'title': await self._generate_title(topic, summaries),
                'authors': [],  # Would be filled from user input
                'abstract': '',
                'sections': {},
                'metadata': {
                    'topic': topic,
                    'word_count': 0,
                    'generation_date': datetime.now().isoformat(),
                    'structure': paper_structure
                }
            }
            
            # Generate sections
            for section_name in paper_structure:
                if section_name in self.sections:
                    try:
                        section_content = await self.sections[section_name](
                            topic, summaries, citations, requirements
                        )
                        paper_draft['sections'][section_name] = section_content
                    except Exception as e:
                        self.logger.error(f"Error generating {section_name}: {str(e)}")
                        paper_draft['sections'][section_name] = f"Error generating {section_name}"
            
            # Calculate word count
            paper_draft['metadata']['word_count'] = self._calculate_word_count(paper_draft)
            
            # Generate abstract last (after all sections are complete)
            paper_draft['abstract'] = await self._generate_abstract(
                topic, summaries, citations, requirements
            )
            
            self.logger.info("Paper generation completed successfully")
            return paper_draft
            
        except Exception as e:
            self.logger.error(f"Error in paper generation: {str(e)}")
            return {'error': str(e)}
    
    def _determine_paper_structure(self, requirements: Dict[str, Any]) -> List[str]:
        """Determine the structure of the paper based on requirements."""
        paper_type = requirements.get('type', 'research_paper')
        length = requirements.get('length', 'medium')
        
        if paper_type == 'review_paper':
            structure = [
                'abstract',
                'introduction',
                'literature_review',
                'discussion',
                'conclusion',
                'references'
            ]
        elif paper_type == 'methodology_paper':
            structure = [
                'abstract',
                'introduction',
                'literature_review',
                'methodology',
                'results',
                'discussion',
                'conclusion',
                'references'
            ]
        else:  # research_paper
            structure = [
                'abstract',
                'introduction',
                'literature_review',
                'methodology',
                'results',
                'discussion',
                'conclusion',
                'references'
            ]
        
        # Adjust based on length
        if length == 'short':
            # Remove methodology and results for short papers
            structure = [s for s in structure if s not in ['methodology', 'results']]
        elif length == 'long':
            # Add additional sections for long papers
            structure.extend(['limitations', 'future_work'])
        
        return structure
    
    async def _generate_title(self, topic: str, summaries: Dict[str, Any]) -> str:
        """Generate an appropriate title for the paper."""
        try:
            # Extract key terms from summaries
            key_findings = summaries.get('key_findings', [])
            themes = summaries.get('thematic_summary', '')
            
            # Create title based on topic and findings
            if key_findings:
                # Use the most relevant finding
                main_finding = key_findings[0] if key_findings else {}
                finding_text = main_finding.get('finding', '')
                
                # Extract key words from finding
                key_words = finding_text.split()[:3]  # Take first 3 words
                title = f"{topic}: {' '.join(key_words)}"
            else:
                title = f"Research on {topic}: A Comprehensive Analysis"
            
            return title
            
        except Exception as e:
            self.logger.error(f"Error generating title: {str(e)}")
            return f"Research on {topic}"
    
    async def _generate_with_llm(self, prompt: str, max_tokens: int = 1000) -> str:
        """Generate content using LLM."""
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.llm_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert academic writer specializing in research paper generation. Always include citation placeholders [1], [2], [3], etc. where references should appear. Use proper academic tone and structure."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return content.strip() if content else ""
            
        except Exception as e:
            self.logger.error(f"Error generating content with LLM: {str(e)}")
            return "Error generating content with AI model."

    async def _generate_abstract(self, topic: str, summaries: Dict[str, Any], 
                               citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the abstract section using LLM."""
        try:
            # Prepare context for LLM
            key_findings = summaries.get('key_findings', [])
            methodology_summary = summaries.get('methodology_summary', {})
            gaps = summaries.get('gaps_and_opportunities', [])
            
            # Build context string
            context_parts = [f"Research topic: {topic}"]
            
            if key_findings:
                findings_text = "\n".join([f"- {f.get('finding', '')}" for f in key_findings[:5]])
                context_parts.append(f"Key findings:\n{findings_text}")
            
            if methodology_summary:
                methodologies = list(methodology_summary.keys())
                context_parts.append(f"Methodologies analyzed: {', '.join(methodologies)}")
            
            if gaps:
                gaps_text = "\n".join([f"- {gap}" for gap in gaps[:3]])
                context_parts.append(f"Research gaps identified:\n{gaps_text}")
            
            context = "\n\n".join(context_parts)
            
            prompt = f"""Write a comprehensive abstract for a research paper on "{topic}". 

Context:
{context}

Requirements:
- 150-300 words
- Include background, methodology, key findings, and implications
- Use citation placeholders [1], [2], [3], etc. where references should appear
- Maintain academic tone
- Focus on the significance and contribution of the research

Abstract:"""

            abstract = await self._generate_with_llm(prompt, max_tokens=400)
            
            # Fallback if LLM fails
            if not abstract or "Error" in abstract:
                abstract_parts = []
                abstract_parts.append(f"This paper presents a comprehensive analysis of {topic} [1].")
                
                if key_findings:
                    findings_text = ", ".join([f.get('finding', '') for f in key_findings[:3]])
                    abstract_parts.append(f"Key findings include: {findings_text} [2, 3].")
                
                methodology_summary = summaries.get('methodology_summary', {})
                if methodology_summary:
                    methodologies = list(methodology_summary.keys())
                    if methodologies:
                        abstract_parts.append(f"Various methodologies were analyzed, including {', '.join(methodologies[:2])} [4, 5].")
                
                gaps = summaries.get('gaps_and_opportunities', [])
                if gaps:
                    abstract_parts.append(f"This analysis identifies several research gaps and opportunities for future work [6].")
                
                abstract = " ".join(abstract_parts)
            
            return abstract
            
        except Exception as e:
            self.logger.error(f"Error generating abstract: {str(e)}")
            return f"This paper provides a comprehensive analysis of {topic} [1]."
    
    async def _generate_introduction(self, topic: str, summaries: Dict[str, Any], 
                                   citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the introduction section using LLM."""
        try:
            # Prepare context
            gaps = summaries.get('gaps_and_opportunities', [])
            key_findings = summaries.get('key_findings', [])
            
            context_parts = [f"Research topic: {topic}"]
            
            if gaps:
                gaps_text = "\n".join([f"- {gap}" for gap in gaps[:3]])
                context_parts.append(f"Research gaps identified:\n{gaps_text}")
            
            if key_findings:
                findings_text = "\n".join([f"- {f.get('finding', '')}" for f in key_findings[:3]])
                context_parts.append(f"Key findings from literature:\n{findings_text}")
            
            context = "\n\n".join(context_parts)
            
            prompt = f"""Write an introduction section for a research paper on "{topic}".

Context:
{context}

Requirements:
- 300-500 words
- Include background, problem statement, objectives, and paper structure
- Use citation placeholders [1], [2], [3], etc. where references should appear
- Maintain academic tone
- Establish the significance and relevance of the research

Introduction:"""

            introduction = await self._generate_with_llm(prompt, max_tokens=600)
            
            # Fallback if LLM fails
            if not introduction or "Error" in introduction:
                introduction_parts = []
                introduction_parts.append(f"{topic} has emerged as a significant area of research with growing importance in various fields [1, 2].")
                
                if gaps:
                    introduction_parts.append(f"However, several challenges and gaps remain in our understanding of this field [3].")
                
                introduction_parts.append(f"This paper aims to provide a comprehensive analysis of {topic}, examining current research trends, methodologies, and identifying opportunities for future work [4].")
                introduction_parts.append("The remainder of this paper is organized as follows: Section 2 presents a review of relevant literature, Section 3 discusses the methodology, Section 4 presents the findings, Section 5 provides a discussion of results, and Section 6 concludes with implications and future directions.")
                
                introduction = "\n\n".join(introduction_parts)
            
            return introduction
            
        except Exception as e:
            self.logger.error(f"Error generating introduction: {str(e)}")
            return f"This paper presents a comprehensive analysis of {topic} [1]."
    
    async def _generate_literature_review(self, topic: str, summaries: Dict[str, Any], 
                                        citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the literature review section using LLM."""
        try:
            # Prepare context
            thematic_summary = summaries.get('thematic_summary', '')
            key_findings = summaries.get('key_findings', [])
            methodology_summary = summaries.get('methodology_summary', {})
            
            context_parts = [f"Research topic: {topic}"]
            
            if thematic_summary:
                context_parts.append(f"Thematic summary:\n{thematic_summary}")
            
            if key_findings:
                findings_text = "\n".join([f"- {f.get('finding', '')}" for f in key_findings[:5]])
                context_parts.append(f"Key findings from literature:\n{findings_text}")
            
            if methodology_summary:
                methods_text = "\n".join([f"- {method}: {len(papers)} papers" for method, papers in methodology_summary.items() if papers])
                context_parts.append(f"Methodologies used in literature:\n{methods_text}")
            
            context = "\n\n".join(context_parts)
            
            prompt = f"""Write a comprehensive literature review section for a research paper on "{topic}".

Context:
{context}

Requirements:
- 800-1200 words
- Organize by themes and chronological development
- Include current state of research, key findings, and methodological approaches
- Use citation placeholders [1], [2], [3], etc. where references should appear
- Maintain academic tone
- Synthesize findings and identify gaps

Literature Review:"""

            literature_review = await self._generate_with_llm(prompt, max_tokens=1200)
            
            # Fallback if LLM fails
            if not literature_review or "Error" in literature_review:
                review_parts = []
                
                review_parts.append("## Current State of Research")
                if thematic_summary:
                    review_parts.append(thematic_summary)
                else:
                    review_parts.append(f"Current research on {topic} spans multiple methodologies and approaches [1, 2].")
                
                if key_findings:
                    review_parts.append("\n## Key Findings")
                    for i, finding in enumerate(key_findings[:5], 1):
                        review_parts.append(f"{i}. {finding.get('finding', '')} [{i+2}]")
                
                if methodology_summary:
                    review_parts.append("\n## Methodological Approaches")
                    for method_type, papers in methodology_summary.items():
                        if papers:
                            review_parts.append(f"### {method_type.title()}")
                            review_parts.append(f"Several studies have employed {method_type} approaches, including:")
                            for j, paper in enumerate(papers[:3]):
                                review_parts.append(f"- {paper.get('title', 'Unknown')} [{j+8}]")
                
                literature_review = "\n\n".join(review_parts)
            
            return literature_review
            
        except Exception as e:
            self.logger.error(f"Error generating literature review: {str(e)}")
            return f"Current research on {topic} spans multiple methodologies and approaches [1]."
    
    async def _generate_methodology(self, topic: str, summaries: Dict[str, Any], 
                                  citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the methodology section."""
        try:
            methodology_parts = []
            
            methodology_parts.append("## Research Methodology")
            methodology_parts.append("This study employed a systematic approach to analyze the current state of research in the field.")
            
            # Data collection
            methodology_parts.append("\n### Data Collection")
            methodology_parts.append("A comprehensive search was conducted across multiple academic databases to identify relevant research papers.")
            
            # Analysis approach
            methodology_parts.append("\n### Analysis Approach")
            methodology_parts.append("The collected papers were analyzed using both qualitative and quantitative methods to identify patterns, trends, and gaps in the research.")
            
            # Evaluation criteria
            methodology_parts.append("\n### Evaluation Criteria")
            methodology_parts.append("Papers were evaluated based on relevance, methodology, findings, and contribution to the field.")
            
            return "\n\n".join(methodology_parts)
            
        except Exception as e:
            self.logger.error(f"Error generating methodology: {str(e)}")
            return "A systematic methodology was employed to analyze the research literature."
    
    async def _generate_results(self, topic: str, summaries: Dict[str, Any], 
                              citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the results section."""
        try:
            results_parts = []
            
            results_parts.append("## Research Results")
            
            # Paper statistics
            individual_summaries = summaries.get('individual_summaries', [])
            results_parts.append(f"\n### Paper Collection")
            results_parts.append(f"A total of {len(individual_summaries)} relevant papers were identified and analyzed.")
            
            # Key findings summary
            key_findings = summaries.get('key_findings', [])
            if key_findings:
                results_parts.append(f"\n### Key Findings")
                for i, finding in enumerate(key_findings[:5], 1):
                    results_parts.append(f"{i}. {finding.get('finding', '')}")
            
            # Methodology distribution
            methodology_summary = summaries.get('methodology_summary', {})
            if methodology_summary:
                results_parts.append(f"\n### Methodology Distribution")
                for method_type, papers in methodology_summary.items():
                    if papers:
                        results_parts.append(f"- {method_type.title()}: {len(papers)} papers")
            
            return "\n\n".join(results_parts)
            
        except Exception as e:
            self.logger.error(f"Error generating results: {str(e)}")
            return "The analysis revealed several key findings in the research literature."
    
    async def _generate_discussion(self, topic: str, summaries: Dict[str, Any], 
                                 citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the discussion section."""
        try:
            discussion_parts = []
            
            discussion_parts.append("## Discussion")
            discussion_parts.append("The analysis of current research reveals several important insights about the field.")
            
            # Implications
            discussion_parts.append("\n### Implications")
            discussion_parts.append("The findings suggest that while significant progress has been made, there are still areas that require further investigation.")
            
            # Limitations
            gaps = summaries.get('gaps_and_opportunities', [])
            if gaps:
                discussion_parts.append("\n### Limitations and Gaps")
                for gap in gaps[:3]:
                    discussion_parts.append(f"- {gap}")
            
            # Future directions
            discussion_parts.append("\n### Future Directions")
            discussion_parts.append("Based on the identified gaps, several areas present opportunities for future research:")
            discussion_parts.append("1. Addressing methodological limitations in current studies")
            discussion_parts.append("2. Exploring interdisciplinary approaches")
            discussion_parts.append("3. Conducting longitudinal studies to understand long-term effects")
            
            return "\n\n".join(discussion_parts)
            
        except Exception as e:
            self.logger.error(f"Error generating discussion: {str(e)}")
            return "The analysis provides valuable insights into the current state of research in this field."
    
    async def _generate_conclusion(self, topic: str, summaries: Dict[str, Any], 
                                 citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the conclusion section."""
        try:
            conclusion_parts = []
            
            conclusion_parts.append("## Conclusion")
            conclusion_parts.append(f"This comprehensive analysis of {topic} has revealed several key insights.")
            
            # Summary of findings
            key_findings = summaries.get('key_findings', [])
            if key_findings:
                conclusion_parts.append("\n### Summary of Findings")
                conclusion_parts.append("The research demonstrates that significant progress has been made in understanding various aspects of the field.")
            
            # Contributions
            conclusion_parts.append("\n### Contributions")
            conclusion_parts.append("This study contributes to the field by:")
            conclusion_parts.append("1. Providing a comprehensive overview of current research")
            conclusion_parts.append("2. Identifying key trends and patterns")
            conclusion_parts.append("3. Highlighting areas for future investigation")
            
            # Final thoughts
            conclusion_parts.append("\n### Final Thoughts")
            conclusion_parts.append("As the field continues to evolve, it is important to build upon these findings and address the identified gaps through rigorous research and innovative approaches.")
            
            return "\n\n".join(conclusion_parts)
            
        except Exception as e:
            self.logger.error(f"Error generating conclusion: {str(e)}")
            return f"This analysis provides valuable insights into {topic} and identifies opportunities for future research."
    
    async def _generate_references(self, topic: str, summaries: Dict[str, Any], 
                                 citations: Dict[str, Any], requirements: Dict[str, Any]) -> str:
        """Generate the references section."""
        try:
            references_parts = []
            
            references_parts.append("## References")
            
            # Get bibliography
            bibliography = citations.get('bibliography', [])
            
            if bibliography:
                # Sort by relevance score
                sorted_biblio = sorted(bibliography, key=lambda x: x.get('relevance_score', 0), reverse=True)
                
                for i, ref in enumerate(sorted_biblio[:20], 1):  # Limit to top 20 references
                    authors = ref.get('authors', ['Unknown'])
                    title = ref.get('title', 'Untitled')
                    journal = ref.get('journal', '')
                    year = ref.get('year', '')
                    
                    # Format reference
                    if len(authors) == 1:
                        author_str = authors[0]
                    elif len(authors) <= 3:
                        author_str = ', '.join(authors[:-1]) + ', & ' + authors[-1]
                    else:
                        author_str = ', '.join(authors[:2]) + ', et al.'
                    
                    reference = f"[{i}] {author_str}. ({year}). {title}. {journal}."
                    references_parts.append(reference)
            else:
                references_parts.append("References will be populated from the analyzed papers.")
            
            return "\n\n".join(references_parts)
            
        except Exception as e:
            self.logger.error(f"Error generating references: {str(e)}")
            return "References will be included based on the analyzed literature."
    
    def _calculate_word_count(self, paper_draft: Dict[str, Any]) -> int:
        """Calculate the total word count of the paper."""
        word_count = 0
        
        # Count words in abstract
        abstract = paper_draft.get('abstract', '')
        word_count += len(abstract.split())
        
        # Count words in sections
        sections = paper_draft.get('sections', {})
        for section_content in sections.values():
            if isinstance(section_content, str):
                word_count += len(section_content.split())
        
        return word_count
