"""
Database models for the research paper generation system.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for storing user information."""
    
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    research_sessions = relationship("ResearchSession", back_populates="user")

class ResearchSession(Base):
    """Research session model for storing research paper generation sessions."""
    
    __tablename__ = 'research_sessions'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    topic = Column(String(500), nullable=False)
    requirements = Column(JSON, nullable=True)
    status = Column(String(50), default='pending')  # pending, in_progress, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="research_sessions")
    papers = relationship("Paper", back_populates="research_session")
    summaries = relationship("Summary", back_populates="research_session")
    analytics = relationship("Analytics", back_populates="research_session")

class Paper(Base):
    """Paper model for storing research papers."""
    
    __tablename__ = 'papers'
    
    id = Column(Integer, primary_key=True, index=True)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    external_id = Column(String(255), unique=True, index=True)  # ID from external source (arXiv, PubMed, etc.)
    title = Column(Text, nullable=False)
    authors = Column(JSON, nullable=True)  # List of author names
    abstract = Column(Text, nullable=True)
    journal = Column(String(500), nullable=True)
    published_date = Column(DateTime, nullable=True)
    url = Column(String(1000), nullable=True)
    doi = Column(String(255), nullable=True)
    keywords = Column(JSON, nullable=True)  # List of keywords
    citations_count = Column(Integer, default=0)
    relevance_score = Column(Float, default=0.0)
    source = Column(String(100), nullable=True)  # arxiv, pubmed, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    research_session = relationship("ResearchSession", back_populates="papers")
    citations = relationship("Citation", back_populates="paper")

class Summary(Base):
    """Summary model for storing paper summaries."""
    
    __tablename__ = 'summaries'
    
    id = Column(Integer, primary_key=True, index=True)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    summary_type = Column(String(100), nullable=False)  # individual, thematic, key_findings, etc.
    content = Column(JSON, nullable=False)  # Summary content in structured format
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    research_session = relationship("ResearchSession", back_populates="summaries")

class Citation(Base):
    """Citation model for storing formatted citations."""
    
    __tablename__ = 'citations'
    
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey('papers.id'), nullable=False)
    citation_style = Column(String(50), nullable=False)  # apa, mla, chicago, ieee
    formatted_text = Column(Text, nullable=False)
    in_text_citation = Column(String(500), nullable=True)
    context = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    paper = relationship("Paper", back_populates="citations")

class GeneratedPaper(Base):
    """Generated paper model for storing final generated papers."""
    
    __tablename__ = 'generated_papers'
    
    id = Column(Integer, primary_key=True, index=True)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=True)
    content = Column(JSON, nullable=False)  # Paper content in structured format
    word_count = Column(Integer, default=0)
    citation_count = Column(Integer, default=0)
    status = Column(String(50), default='draft')  # draft, final, published
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    research_session = relationship("ResearchSession")

class Analytics(Base):
    """Analytics model for storing analysis results."""
    
    __tablename__ = 'analytics'
    
    id = Column(Integer, primary_key=True, index=True)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    analytics_type = Column(String(100), nullable=False)  # paper_metrics, content_analysis, etc.
    data = Column(JSON, nullable=False)  # Analytics data in structured format
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    research_session = relationship("ResearchSession", back_populates="analytics")

class CitationNetwork(Base):
    """Citation network model for storing paper relationships."""
    
    __tablename__ = 'citation_networks'
    
    id = Column(Integer, primary_key=True, index=True)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    source_paper_id = Column(Integer, ForeignKey('papers.id'), nullable=False)
    target_paper_id = Column(Integer, ForeignKey('papers.id'), nullable=False)
    relationship_type = Column(String(100), nullable=False)  # cites, similar, related
    strength = Column(Float, default=0.0)  # Relationship strength (0-1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    source_paper = relationship("Paper", foreign_keys=[source_paper_id])
    target_paper = relationship("Paper", foreign_keys=[target_paper_id])

class UserPreferences(Base):
    """User preferences model for storing user settings."""
    
    __tablename__ = 'user_preferences'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    preference_key = Column(String(100), nullable=False)
    preference_value = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class APILog(Base):
    """API log model for tracking API usage and errors."""
    
    __tablename__ = 'api_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=False)
    response_time = Column(Float, nullable=True)  # Response time in milliseconds
    error_message = Column(Text, nullable=True)
    request_data = Column(JSON, nullable=True)
    response_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class SystemMetrics(Base):
    """System metrics model for storing system performance data."""
    
    __tablename__ = 'system_metrics'
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(50), nullable=True)
    metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Index for time-series queries
    __table_args__ = (
        {'extend_existing': True}
    )

# Additional models for specific features

class ResearchTemplate(Base):
    """Template model for storing research paper templates."""
    
    __tablename__ = 'research_templates'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    template_type = Column(String(100), nullable=False)  # research_paper, review, methodology
    structure = Column(JSON, nullable=False)  # Template structure definition
    is_public = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = relationship("User")

class Feedback(Base):
    """Feedback model for storing user feedback on generated papers."""
    
    __tablename__ = 'feedback'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    feedback_type = Column(String(100), nullable=False)  # quality, relevance, completeness
    rating = Column(Integer, nullable=False)  # 1-5 scale
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    research_session = relationship("ResearchSession")

class Collaboration(Base):
    """Collaboration model for storing collaborative research sessions."""
    
    __tablename__ = 'collaborations'
    
    id = Column(Integer, primary_key=True, index=True)
    research_session_id = Column(Integer, ForeignKey('research_sessions.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    role = Column(String(50), nullable=False)  # owner, collaborator, viewer
    permissions = Column(JSON, nullable=True)  # Specific permissions
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    research_session = relationship("ResearchSession")
    user = relationship("User")
