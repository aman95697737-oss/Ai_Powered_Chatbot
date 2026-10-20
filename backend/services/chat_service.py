import logging
from typing import Dict, Any, Optional
from backend.services.ai_service import ai_service
from backend.services.dataset_service import dataset_service

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self):
        self.ai_service = ai_service
        self.dataset_service = dataset_service

    async def process_question(self, question: str) -> Dict[str, Any]:
        """
        Core response logic:
        STEP 1 - Receive & validate question
        STEP 2 - Try AI API
        STEP 3 - Check AI response -> if success return source='ai'
        STEP 4 - On API failure / token limit / error -> gracefully fallback
        STEP 5 - Search local dataset (student_faq.json) for relevant answer -> source='dataset'
        STEP 6 - If no dataset match -> friendly fallback response
        """
        clean_question = question.strip()
        if not clean_question:
            return {
                "success": False,
                "answer": "Please enter a valid question about university life, academics, or campus facilities.",
                "source": "system",
                "category": None,
                "confidence": 0.0,
                "suggested_questions": self.dataset_service.get_suggested_questions()
            }

        # STEP 2 & 3: Primary Path - Attempt Real AI Generation from API
        try:
            logger.info(f"[ChatService] Querying AI Model for: '{clean_question[:60]}...'")
            ai_answer = await self.ai_service.generate_response(clean_question)
            
            # Fetch suggested questions if category matches
            matched_faq, _ = self.dataset_service.find_best_match(clean_question, threshold=0.35)
            suggested = self.dataset_service.get_suggested_questions(
                current_category=matched_faq["category"] if matched_faq else None
            )

            return {
                "success": True,
                "answer": ai_answer,
                "source": "ai",
                "category": matched_faq["category"] if matched_faq else None,
                "confidence": 1.0,
                "suggested_questions": suggested
            }

        except Exception as ai_err:
            # STEP 4: Fallback Path - Triggered ONLY when API limit expires, quota exhausted, or API error occurs
            logger.warning(
                f"[ChatService] AI API limit reached / error ({ai_err}). "
                "Switching to Local Dataset Knowledge Base."
            )

            lower_q = clean_question.lower().strip()
            greetings = {"hi", "hello", "hey", "how are you", "who are you", "what can you do", "good morning", "good afternoon", "good evening", "namaste"}
            if lower_q in greetings or any(lower_q.startswith(g + " ") for g in ["hi", "hello", "hey"]):
                return {
                    "success": True,
                    "answer": (
                        "Hello! I am your University Student Guide. I'm currently running on the local campus knowledge base. "
                        "How can I help you today? You can ask me about admissions, course registration, attendance rules, "
                        "exam schedules, tuition fees, scholarships, hostel curfews, or library access."
                    ),
                    "source": "dataset",
                    "category": "General",
                    "confidence": 1.0,
                    "suggested_questions": self.dataset_service.get_suggested_questions()
                }

            # STEP 5: Search predefined dataset (student_faq.json)
            matched_faq, score = self.dataset_service.find_best_match(clean_question, threshold=0.15)

            if matched_faq:
                logger.info(
                    f"[ChatService] Fallback Knowledge Base match (ID {matched_faq['id']}, "
                    f"Score {score}) for category: {matched_faq.get('category')}"
                )
                suggested = self.dataset_service.get_suggested_questions(
                    current_category=matched_faq["category"]
                )
                return {
                    "success": True,
                    "answer": matched_faq["answer"],
                    "source": "dataset",
                    "category": matched_faq.get("category"),
                    "confidence": score,
                    "suggested_questions": suggested
                }

            # STEP 6: Courteous administrative fallback if no specific FAQ matched
            logger.info("[ChatService] No confident dataset match found in fallback mode.")
            return {
                "success": True,
                "answer": (
                    f"Regarding '{clean_question}': I don't have the exact record in the local knowledge base right now. "
                    "Please reach out to the student helpdesk (helpdesk@university.edu) or try asking about attendance, exams, fees, library, or admissions."
                ),
                "source": "dataset",
                "category": None,
                "confidence": score,
                "suggested_questions": self.dataset_service.get_suggested_questions()
            }


chat_service = ChatService()
