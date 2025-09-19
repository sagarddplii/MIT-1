"""
Pydantic schemas for API request/response models.
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

# Enums
class ResearchStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class CitationStyle(str, Enum):
    APA = "apa"
    MLA = "mla"
    CHICAGO = "chicago"
    IEEE = "ieee"

class PaperType(str, Enum):
    RESEARCH_PAPER = "research_paper"
    REVIEW_PAPER = "review_paper"
    METHODOLOGY_PAPER = "methodology_paper"

class PaperLength(str, Enum):
    SHORT = "short"
    MEDIUM = "medium"
    LONG = "long"

# User schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Research session schemas
class ResearchRequirements(BaseModel):
    length: PaperLength = PaperLength.MEDIUM
    type: PaperType = PaperType.RESEARCH_PAPER
    focus_areas: List[str] = []
    max_papers: int = Field(default=50, ge=1, le=200)
    sources: List[str] = Field(default=["arxiv", "pubmed"])
    citation_style: CitationStyle = CitationStyle.APA
    publication_target: Optional[str] = None

class ResearchSessionCreate(BaseModel):
    topic: str = Field(..., min_length=5, max_length=500)
    requirements: Optional[ResearchRequirements] = None

class ResearchSessionUpdate(BaseModel):
    topic: Optional[str] = None
    requirements: Optional[ResearchRequirements] = None
    status: Optional[ResearchStatus] = None

class ResearchSessionResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    requirements: Optional[Dict[str, Any]] = None
    status: ResearchStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Paper schemas
class AuthorInfo(BaseModel):
    name: str
    affiliation: Optional[str] = None
    orcid: Optional[str] = None

class PaperCreate(BaseModel):
    external_id: Optional[str] = None
    title: str
    authors: Optional[List[AuthorInfo]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    published_date: Optional[datetime] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: Optional[List[str]] = None
    source: Optional[str] = None

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[List[AuthorInfo]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    published_date: Optional[datetime] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: Optional[List[str]] = None
    citations_count: Optional[int] = None
    relevance_score: Optional[float] = None

class PaperResponse(BaseModel):
    id: int
    research_session_id: int
    external_id: Optional[str] = None
    title: str
    authors: Optional[List[AuthorInfo]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    published_date: Optional[datetime] = None
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: Optional[List[str]] = None
    citations_count: int
    relevance_score: float
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Summary schemas
class SummaryCreate(BaseModel):
    summary_type: str
    content: Dict[str, Any]

class SummaryResponse(BaseModel):
    id: int
    research_session_id: int
    summary_type: str
    content: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Citation schemas
class CitationCreate(BaseModel):
    paper_id: int
    citation_style: CitationStyle
    formatted_text: str
    in_text_citation: Optional[str] = None
    context: Optional[str] = None

class CitationResponse(BaseModel):
    id: int
    paper_id: int
    citation_style: CitationStyle
    formatted_text: str
    in_text_citation: Optional[str] = None
    context: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Generated paper schemas
class PaperSection(BaseModel):
    title: str
    content: str
    word_count: Optional[int] = None

class GeneratedPaperCreate(BaseModel):
    research_session_id: int
    title: str
    abstract: Optional[str] = None
    content: Dict[str, Any]
    word_count: Optional[int] = None

class GeneratedPaperUpdate(BaseModel):
    title: Optional[str] = None
    abstract: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    word_count: Optional[int] = None
    status: Optional[str] = None

class GeneratedPaperResponse(BaseModel):
    id: int
    research_session_id: int
    title: str
    abstract: Optional[str] = None
    content: Dict[str, Any]
    word_count: int
    citation_count: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Analytics schemas
class AnalyticsCreate(BaseModel):
    research_session_id: int
    analytics_type: str
    data: Dict[str, Any]

class AnalyticsResponse(BaseModel):
    id: int
    research_session_id: int
    analytics_type: str
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Citation network schemas
class CitationNetworkCreate(BaseModel):
    research_session_id: int
    source_paper_id: int
    target_paper_id: int
    relationship_type: str
    strength: float = Field(..., ge=0.0, le=1.0)

class CitationNetworkResponse(BaseModel):
    id: int
    research_session_id: int
    source_paper_id: int
    target_paper_id: int
    relationship_type: str
    strength: float
    created_at: datetime

    class Config:
        from_attributes = True

# User preferences schemas
class UserPreferenceCreate(BaseModel):
    preference_key: str
    preference_value: Dict[str, Any]

class UserPreferenceUpdate(BaseModel):
    preference_value: Dict[str, Any]

class UserPreferenceResponse(BaseModel):
    id: int
    user_id: int
    preference_key: str
    preference_value: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# API log schemas
class APILogCreate(BaseModel):
    user_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: int
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    request_data: Optional[Dict[str, Any]] = None
    response_data: Optional[Dict[str, Any]] = None

class APILogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: int
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# System metrics schemas
class SystemMetricCreate(BaseModel):
    metric_name: str
    metric_value: float
    metric_unit: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SystemMetricResponse(BaseModel):
    id: int
    metric_name: str
    metric_value: float
    metric_unit: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# Research template schemas
class ResearchTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    template_type: str
    structure: Dict[str, Any]
    is_public: bool = False

class ResearchTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    structure: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class ResearchTemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    template_type: str
    structure: Dict[str, Any]
    is_public: bool
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Feedback schemas
class FeedbackCreate(BaseModel):
    research_session_id: int
    feedback_type: str
    rating: int = Field(..., ge=1, le=5)
    comments: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    research_session_id: int
    feedback_type: str
    rating: int
    comments: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Collaboration schemas
class CollaborationCreate(BaseModel):
    research_session_id: int
    user_id: int
    role: str
    permissions: Optional[Dict[str, Any]] = None

class CollaborationUpdate(BaseModel):
    role: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = None

class CollaborationResponse(BaseModel):
    id: int
    research_session_id: int
    user_id: int
    role: str
    permissions: Optional[Dict[str, Any]] = None
    joined_at: datetime

    class Config:
        from_attributes = True

# Response schemas for API endpoints
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

# Validation schemas
class TopicValidation(BaseModel):
    topic: str = Field(..., min_length=5, max_length=500)
    
    @validator('topic')
    def validate_topic(cls, v):
        if not v.strip():
            raise ValueError('Topic cannot be empty')
        if len(v.split()) < 2:
            raise ValueError('Topic must contain at least 2 words')
        return v.strip()

class RequirementsValidation(BaseModel):
    requirements: ResearchRequirements
    
    @validator('requirements')
    def validate_requirements(cls, v):
        if v.max_papers > 200:
            raise ValueError('Maximum papers cannot exceed 200')
        if v.max_papers < 1:
            raise ValueError('Maximum papers must be at least 1')
        return v
