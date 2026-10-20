from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000, description="The university student's question")


class FAQItem(BaseModel):
    id: int
    category: str
    question: str
    keywords: List[str] = []
    answer: str


class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    source: str = Field(..., description="'ai' | 'dataset' | 'system'")
    category: Optional[str] = None
    confidence: Optional[float] = None
    suggested_questions: Optional[List[str]] = []


class CategoryResponse(BaseModel):
    categories: List[str]
    total_categories: int


class FAQListResponse(BaseModel):
    total: int
    faqs: List[FAQItem]


class HealthResponse(BaseModel):
    status: str
    dataset_entries: int
    ai_status: str
    simulate_ai_failure: bool


class DemoToggleRequest(BaseModel):
    simulate_failure: bool
