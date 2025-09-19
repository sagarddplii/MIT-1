#!/usr/bin/env python3
"""
Test script for LLM integration with the MIT Research Paper Generator.
Tests the "AI in Healthcare" prompt as requested.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from coordinator.main import ResearchCoordinator
from agents.retrieval_agent import RetrievalAgent
from agents.paper_generator_agent import PaperGeneratorAgent
from agents.citation_agent import CitationAgent

async def test_llm_integration():
    """Test the LLM integration with a real prompt."""
    
    print("🚀 Testing MIT Research Paper Generator LLM Integration")
    print("=" * 60)
    
    # Check for required environment variables
    required_env_vars = ['OPENAI_API_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set the following environment variables:")
        for var in missing_vars:
            print(f"  export {var}=your_api_key")
        return False
    
    try:
        # Initialize the coordinator
        print("📋 Initializing Research Coordinator...")
        coordinator = ResearchCoordinator()
        await coordinator.initialize_agents()
        print("✅ Coordinator initialized successfully")
        
        # Test parameters
        topic = "AI in Healthcare"
        requirements = {
            'length': 'medium',
            'type': 'research_paper',
            'max_papers': 10,  # Reduced for testing
            'sources': ['semantic_scholar', 'pubmed'],  # Use reliable APIs
            'focus_areas': ['diagnosis', 'treatment', 'drug_discovery'],
            'citation_style': 'apa'
        }
        
        print(f"\n🔍 Testing with topic: '{topic}'")
        print(f"📊 Requirements: {requirements}")
        
        # Step 1: Test paper retrieval
        print("\n📚 Step 1: Testing Paper Retrieval...")
        retrieval_agent = RetrievalAgent()
        papers = await retrieval_agent.retrieve_papers(topic, requirements)
        print(f"✅ Retrieved {len(papers)} papers")
        
        if papers:
            print("📄 Sample papers:")
            for i, paper in enumerate(papers[:3], 1):
                print(f"  {i}. {paper.get('title', 'No title')[:80]}...")
                print(f"     Authors: {', '.join(paper.get('authors', [])[:2])}")
                print(f"     Source: {paper.get('source', 'Unknown')}")
                print(f"     Year: {paper.get('year', 'Unknown')}")
                print()
        
        # Step 2: Test LLM paper generation
        print("🤖 Step 2: Testing LLM Paper Generation...")
        
        # Create mock summaries for testing
        mock_summaries = {
            'thematic_summary': f"Research on {topic} has shown significant progress in recent years, with applications spanning diagnosis, treatment optimization, and drug discovery.",
            'key_findings': [
                {'finding': 'AI models achieve high accuracy in medical image diagnosis', 'confidence': 0.9},
                {'finding': 'Machine learning improves treatment outcome prediction', 'confidence': 0.8},
                {'finding': 'Natural language processing aids in clinical decision support', 'confidence': 0.7}
            ],
            'methodology_summary': {
                'machine_learning': [{'title': 'Deep Learning for Medical Imaging', 'year': 2023}],
                'natural_language_processing': [{'title': 'NLP in Clinical Text Analysis', 'year': 2023}],
                'reinforcement_learning': [{'title': 'RL for Treatment Optimization', 'year': 2022}]
            },
            'gaps_and_opportunities': [
                'Limited real-world validation studies',
                'Need for better interpretability in AI models',
                'Integration challenges with existing healthcare systems'
            ]
        }
        
        mock_citations = {'bibliography': papers[:5]}  # Use first 5 papers
        
        paper_generator = PaperGeneratorAgent()
        paper_draft = await paper_generator.generate_draft(topic, mock_summaries, mock_citations, requirements)
        
        print("✅ Paper draft generated successfully")
        print(f"📝 Title: {paper_draft.get('title', 'No title')}")
        print(f"📊 Word count: {paper_draft.get('metadata', {}).get('word_count', 0)}")
        
        # Check for citation placeholders
        print("\n🔍 Checking for citation placeholders...")
        abstract = paper_draft.get('abstract', '')
        placeholder_count = abstract.count('[') and abstract.count(']')
        print(f"📌 Found {placeholder_count} citation placeholders in abstract")
        
        if placeholder_count > 0:
            print("✅ Citation placeholders detected - LLM integration working!")
            print(f"📄 Abstract preview: {abstract[:200]}...")
        else:
            print("⚠️  No citation placeholders found - check LLM prompt")
        
        # Step 3: Test citation replacement
        print("\n📋 Step 3: Testing Citation Replacement...")
        citation_agent = CitationAgent()
        
        # Test with a simple text containing placeholders
        test_text = "AI in healthcare has shown promising results [1]. Recent studies demonstrate significant improvements [2, 3] in diagnostic accuracy."
        replaced_text = await citation_agent.replace_citation_placeholders(
            test_text, papers[:3], 'apa'
        )
        
        print(f"📝 Original text: {test_text}")
        print(f"📝 Replaced text: {replaced_text}")
        
        if '[1]' not in replaced_text and '[2]' not in replaced_text:
            print("✅ Citation placeholders successfully replaced!")
        else:
            print("⚠️  Citation placeholders not fully replaced")
        
        # Step 4: Test full workflow
        print("\n🔄 Step 4: Testing Full Workflow...")
        try:
            result = await coordinator.generate_research_paper(topic, requirements)
            
            if result.get('status') == 'completed':
                print("✅ Full workflow completed successfully!")
                
                # Check final paper for proper citations
                final_paper = result.get('paper_draft', {})
                final_abstract = final_paper.get('abstract', '')
                
                if '[' not in final_abstract and ']' not in final_abstract:
                    print("✅ Final paper has proper citations (no placeholders)")
                else:
                    print("⚠️  Final paper still contains placeholders")
                
                print(f"📊 Final word count: {final_paper.get('metadata', {}).get('word_count', 0)}")
                
            else:
                print(f"❌ Full workflow failed: {result.get('message', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Full workflow error: {str(e)}")
        
        print("\n🎉 LLM Integration Test Complete!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_citation_formats():
    """Test different citation formats."""
    print("\n📚 Testing Citation Formats...")
    
    # Sample paper data
    sample_paper = {
        'title': 'Deep Learning for Medical Image Analysis',
        'authors': ['John Smith', 'Jane Doe', 'Bob Johnson'],
        'year': 2023,
        'doi': '10.1038/s41586-023-12345-6',
        'abstract': 'This paper presents a novel deep learning approach...',
        'journal': 'Nature',
        'url': 'https://doi.org/10.1038/s41586-023-12345-6',
        'citations_count': 150,
        'source': 'semantic_scholar'
    }
    
    citation_agent = CitationAgent()
    
    styles = ['apa', 'mla', 'chicago', 'ieee']
    
    for style in styles:
        citation = citation_agent._format_citation(sample_paper, style)
        print(f"\n📋 {style.upper()} Format:")
        print(f"   {citation}")
    
    print("✅ Citation format testing complete!")

def print_usage():
    """Print usage instructions."""
    print("""
MIT Research Paper Generator - LLM Integration Test

Usage:
    python test_llm_integration.py [options]

Options:
    --full           Run full integration test (default)
    --citations      Test citation formats only
    --help           Show this help message

Environment Variables Required:
    OPENAI_API_KEY   Your OpenAI API key

Example:
    export OPENAI_API_KEY=sk-your-key-here
    python test_llm_integration.py --full
""")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test LLM integration for MIT Research Paper Generator')
    parser.add_argument('--full', action='store_true', default=True, help='Run full integration test')
    parser.add_argument('--citations', action='store_true', help='Test citation formats only')
    parser.add_argument('--help-usage', action='store_true', help='Show usage instructions')
    
    args = parser.parse_args()
    
    if args.help_usage:
        print_usage()
        sys.exit(0)
    
    if args.citations:
        asyncio.run(test_citation_formats())
    else:
        asyncio.run(test_llm_integration())
