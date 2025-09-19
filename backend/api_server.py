#!/usr/bin/env python3
"""
FastAPI server for the MIT Research Paper Generator.
Provides REST API endpoints for testing and integration.
"""

import asyncio
import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging

# Import our modules
from coordinator.main import ResearchCoordinator
from agents.retrieval_agent import RetrievalAgent
from agents.paper_generator_agent import PaperGeneratorAgent
from agents.citation_agent import CitationAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MIT Research Paper Generator API",
    description="AI-powered research paper generation with LLM integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global coordinator instance
coordinator: Optional[ResearchCoordinator] = None

# Pydantic models for API
class ResearchRequest(BaseModel):
    topic: str
    requirements: Optional[Dict[str, Any]] = {
        'length': 'medium',
        'type': 'research_paper',
        'max_papers': 20,
        'sources': ['semantic_scholar', 'pubmed'],
        'focus_areas': [],
        'citation_style': 'apa'
    }

class ResearchResponse(BaseModel):
    status: str
    topic: str
    paper_draft: Optional[Dict[str, Any]] = None
    citations: Optional[Dict[str, Any]] = None
    analytics: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None

class TestRequest(BaseModel):
    prompt: str = "AI in Healthcare"
    max_papers: int = 10

class TestResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the coordinator on startup."""
    global coordinator
    try:
        logger.info("Initializing Research Coordinator...")
        coordinator = ResearchCoordinator()
        await coordinator.initialize_agents()
        logger.info("✅ Coordinator initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize coordinator: {str(e)}")
        coordinator = None

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "MIT Research Paper Generator API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "test": "/test",
            "generate": "/generate",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    if coordinator is None:
        raise HTTPException(status_code=503, detail="Coordinator not initialized")
    
    # Check if OpenAI API key is configured
    openai_key = os.getenv('OPENAI_API_KEY')
    if not openai_key:
        return {
            "status": "warning",
            "message": "OpenAI API key not configured",
            "coordinator": "ready"
        }
    
    return {
        "status": "healthy",
        "message": "All systems operational",
        "coordinator": "ready",
        "openai": "configured"
    }

@app.post("/test", response_model=TestResponse)
async def test_integration(request: TestRequest):
    """Test endpoint for LLM integration."""
    try:
        if coordinator is None:
            raise HTTPException(status_code=503, detail="Coordinator not initialized")
        
        logger.info(f"🧪 Testing with prompt: '{request.prompt}'")
        
        # Test requirements
        requirements = {
            'length': 'short',
            'type': 'research_paper',
            'max_papers': request.max_papers,
            'sources': ['semantic_scholar', 'pubmed'],
            'focus_areas': [],
            'citation_style': 'apa'
        }
        
        # Run the generation
        result = await coordinator.generate_research_paper(request.prompt, requirements)
        
        if result.get('status') == 'completed':
            paper_draft = result.get('paper_draft', {})
            abstract = paper_draft.get('abstract', '')
            
            # Check for citation placeholders
            placeholder_count = abstract.count('[') and abstract.count(']')
            
            return TestResponse(
                success=True,
                message=f"✅ Test completed successfully! Generated {paper_draft.get('metadata', {}).get('word_count', 0)} words",
                data={
                    'topic': request.prompt,
                    'word_count': paper_draft.get('metadata', {}).get('word_count', 0),
                    'placeholder_count': placeholder_count,
                    'abstract_preview': abstract[:200] + "..." if len(abstract) > 200 else abstract,
                    'sections': list(paper_draft.get('sections', {}).keys())
                }
            )
        else:
            return TestResponse(
                success=False,
                message=f"❌ Test failed: {result.get('message', 'Unknown error')}",
                data=result
            )
            
    except Exception as e:
        logger.error(f"Test error: {str(e)}")
        return TestResponse(
            success=False,
            message=f"❌ Test error: {str(e)}",
            data=None
        )

@app.post("/generate", response_model=ResearchResponse)
async def generate_research_paper(request: ResearchRequest):
    """Generate a complete research paper."""
    try:
        if coordinator is None:
            raise HTTPException(status_code=503, detail="Coordinator not initialized")
        
        logger.info(f"📝 Generating paper for topic: '{request.topic}'")
        
        # Run the generation
        result = await coordinator.generate_research_paper(request.topic, request.requirements)
        
        if result.get('status') == 'completed':
            return ResearchResponse(
                status="completed",
                topic=request.topic,
                paper_draft=result.get('paper_draft'),
                citations=result.get('citations'),
                analytics=result.get('analytics')
            )
        else:
            return ResearchResponse(
                status="error",
                topic=request.topic,
                message=result.get('message', 'Unknown error')
            )
            
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        return ResearchResponse(
            status="error",
            topic=request.topic,
            error=str(e)
        )

@app.get("/test-citations")
async def test_citations():
    """Test citation formatting."""
    try:
        citation_agent = CitationAgent()
        
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
        
        citations = {}
        styles = ['apa', 'mla', 'chicago', 'ieee']
        
        for style in styles:
            citations[style] = citation_agent._format_citation(sample_paper, style)
        
        return {
            "success": True,
            "message": "Citation formats generated successfully",
            "citations": citations
        }
        
    except Exception as e:
        logger.error(f"Citation test error: {str(e)}")
        return {
            "success": False,
            "message": f"Citation test error: {str(e)}",
            "citations": {}
        }

@app.get("/test-retrieval")
async def test_retrieval():
    """Test paper retrieval from academic APIs."""
    try:
        retrieval_agent = RetrievalAgent()
        
        # Test with a simple topic
        topic = "machine learning healthcare"
        requirements = {
            'max_papers': 5,
            'sources': ['semantic_scholar', 'pubmed']
        }
        
        papers = await retrieval_agent.retrieve_papers(topic, requirements)
        
        return {
            "success": True,
            "message": f"Retrieved {len(papers)} papers successfully",
            "papers": [
                {
                    "title": paper.get('title', 'No title'),
                    "authors": paper.get('authors', []),
                    "year": paper.get('year', 'Unknown'),
                    "source": paper.get('source', 'Unknown'),
                    "relevance_score": paper.get('relevance_score', 0.0)
                }
                for paper in papers[:3]  # Return first 3 papers
            ]
        }
        
    except Exception as e:
        logger.error(f"Retrieval test error: {str(e)}")
        return {
            "success": False,
            "message": f"Retrieval test error: {str(e)}",
            "papers": []
        }

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print("🚀 Starting MIT Research Paper Generator API Server")
    print(f"📍 Server will run on http://{host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🧪 Test endpoint: http://{host}:{port}/test")
    
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
