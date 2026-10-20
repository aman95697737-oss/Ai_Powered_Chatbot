from typing import Optional
from fastapi import APIRouter, Query, status
from backend.models.schemas import CategoryResponse, FAQListResponse, FAQItem
from backend.services.dataset_service import dataset_service

router = APIRouter(prefix="/api", tags=["Knowledge Base FAQs"])


@router.get("/faqs", response_model=FAQListResponse, status_code=status.HTTP_200_OK)
async def get_faqs(category: Optional[str] = Query(None, description="Optional category filter")):
    """
    Returns available FAQ questions and answers, optionally filtered by category.
    """
    if category:
        items = dataset_service.get_faqs_by_category(category)
    else:
        items = dataset_service.get_all_faqs()

    faq_objects = [FAQItem(**item) for item in items]
    return FAQListResponse(total=len(faq_objects), faqs=faq_objects)


@router.get("/categories", response_model=CategoryResponse, status_code=status.HTTP_200_OK)
async def get_categories():
    """
    Returns all 20+ distinct categories available in the university dataset.
    """
    categories = dataset_service.get_categories()
    return CategoryResponse(categories=categories, total_categories=len(categories))


@router.get("/faqs/search", status_code=status.HTTP_200_OK)
async def search_faqs(q: str = Query(..., min_length=1, description="Search query")):
    """
    Directly queries the dataset service without involving the AI API.
    """
    best_match, score = dataset_service.find_best_match(q)
    return {
        "query": q,
        "matched": bool(best_match),
        "score": score,
        "result": best_match
    }
