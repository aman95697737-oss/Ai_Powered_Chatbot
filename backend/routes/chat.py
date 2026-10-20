import logging
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.schemas import ChatRequest, ChatResponse, DemoToggleRequest
from backend.services.chat_service import chat_service
from backend.services.ai_service import ai_service
from backend.utils.auth_deps import get_optional_current_user, get_current_user
from backend.database.mongodb import db_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_endpoint(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Primary chat endpoint for university students.
    Attempts AI generation, and automatically falls back to local knowledge base if unavailable.
    Saves conversation history to MongoDB when student is logged in.
    """
    try:
        result = await chat_service.process_question(request.question)
        
        # If user is authenticated, persist question & answer to MongoDB chat_messages
        if current_user and current_user.get("id"):
            try:
                chat_col = db_manager.chat_messages
                doc = {
                    "user_id": current_user["id"],
                    "user_email": current_user["email"],
                    "question": request.question,
                    "answer": result.get("answer", ""),
                    "source": result.get("source", "ai"),
                    "category": result.get("category"),
                    "confidence": result.get("confidence", 1.0),
                    "created_at": datetime.now(timezone.utc),
                    "timestamp_str": datetime.now().strftime("%I:%M %p")
                }
                await chat_col.insert_one(doc)
            except Exception as db_err:
                logger.warning(f"Could not persist chat message to MongoDB: {db_err}")

        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Unexpected error in /api/chat: {e}", exc_info=True)
        return ChatResponse(
            success=False,
            answer="The university assistant encountered a temporary internal problem. Please try again shortly.",
            source="system",
            category=None,
            confidence=0.0,
            suggested_questions=[
                "What is the minimum attendance requirement?",
                "How can I apply for a scholarship?"
            ]
        )


@router.get("/chat/history")
async def get_user_chat_history(current_user: dict = Depends(get_current_user)):
    """
    Retrieve stored chat history for the authenticated student from MongoDB.
    """
    try:
        chat_col = db_manager.chat_messages
        cursor = chat_col.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(50)
        history = []
        async for doc in cursor:
            history.append({
                "id": str(doc["_id"]),
                "question": doc.get("question", ""),
                "answer": doc.get("answer", ""),
                "source": doc.get("source", "ai"),
                "category": doc.get("category"),
                "timestamp": doc.get("timestamp_str") or "Recently",
                "created_at": str(doc.get("created_at", ""))
            })
        return {
            "success": True,
            "user_id": current_user["id"],
            "count": len(history),
            "history": history
        }
    except Exception as e:
        logger.error(f"Error fetching chat history from MongoDB: {e}")
        return {"success": False, "history": []}


@router.delete("/chat/history")
async def clear_user_chat_history(current_user: dict = Depends(get_current_user)):
    """
    Clear all chat history for the authenticated student in MongoDB.
    """
    try:
        chat_col = db_manager.chat_messages
        res = await chat_col.delete_many({"user_id": current_user["id"]})
        return {
            "success": True,
            "message": f"Cleared {getattr(res, 'deleted_count', 0)} conversation messages."
        }
    except Exception as e:
        logger.error(f"Error clearing chat history: {e}")
        raise HTTPException(status_code=500, detail="Could not clear chat history.")


@router.delete("/chat/history/{message_id}")
async def delete_single_chat_history(message_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a specific conversation entry from MongoDB.
    """
    try:
        from bson import ObjectId
        query = {"_id": message_id, "user_id": current_user["id"]}
        chat_col = db_manager.chat_messages
        res = await chat_col.delete_one(query)
        if getattr(res, "deleted_count", 0) == 0:
            # Try ObjectId if valid
            try:
                res = await chat_col.delete_one({"_id": ObjectId(message_id), "user_id": current_user["id"]})
            except Exception:
                pass
        return {"success": True, "message": "Conversation item deleted."}
    except Exception as e:
        logger.error(f"Error deleting chat history item: {e}")
        raise HTTPException(status_code=500, detail="Could not delete chat entry.")


@router.get("/demo/mode")
async def get_demo_mode():
    """
    Returns the current AI and fallback mode status for viva demonstrations.
    """
    status_info = ai_service.get_status()
    return {
        "success": True,
        "mode": "Simulated Fallback Mode" if status_info["simulate_failure"] else "AI Mode",
        "simulate_ai_failure": status_info["simulate_failure"],
        "use_mock_ai": status_info["use_mock_ai"],
        "api_configured": status_info["api_configured"],
        "model": status_info["model"]
    }


@router.post("/demo/toggle")
async def toggle_demo_failure(request: DemoToggleRequest):
    """
    Allows instructors or evaluators to toggle AI Failure simulation
    to verify that the fallback mechanism seamlessly takes over.
    """
    ai_service.set_simulate_failure(request.simulate_failure)
    current_mode = "Simulated Fallback (Dataset Mode)" if request.simulate_failure else "AI Mode"
    logger.info(f"Demo toggle switched to: {current_mode}")
    return {
        "success": True,
        "simulate_ai_failure": request.simulate_failure,
        "message": f"Demonstration mode switched to: {current_mode}"
    }
