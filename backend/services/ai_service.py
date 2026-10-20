import logging
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
import httpx

_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path)
else:
    load_dotenv()

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.api_key = (os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY", "")).strip()
        self.base_url = os.getenv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta").strip().rstrip("/")
        self.model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
        
        # Flags for demonstration and testing
        self.use_mock_ai = os.getenv("USE_MOCK_AI", "false").lower() in ("true", "1", "yes")
        self.simulate_failure = os.getenv("SIMULATE_AI_FAILURE", "false").lower() in ("true", "1", "yes")
        self.timeout = float(os.getenv("AI_TIMEOUT_SECONDS", "12.0"))

    def set_simulate_failure(self, state: bool):
        self.simulate_failure = state
        logger.info(f"Simulate AI failure set to: {self.simulate_failure}")

    def get_status(self) -> dict:
        return {
            "api_configured": bool(self.api_key),
            "provider": "Google Gemini AI",
            "model": self.model,
            "use_mock_ai": self.use_mock_ai,
            "simulate_failure": self.simulate_failure,
        }

    async def generate_response(self, question: str) -> str:
        """
        Attempts to generate an AI answer using Google Gemini API.
        Raises an Exception if:
        - simulate_failure is active
        - API key is missing
        - External API returns 429 rate limit, quota exhaustion, or error
        - Request times out or network connection fails
        """
        if self.simulate_failure:
            logger.warning("[Gemini AI Service] Simulated AI Failure is ACTIVE.")
            raise RuntimeError("Simulated AI Failure: Rate limit or upstream API service unavailable.")

        if not self.api_key:
            if self.use_mock_ai:
                return await self._generate_mock_ai_response(question)
            else:
                logger.info("[Gemini AI Service] No GEMINI_API_KEY configured. Triggering dataset fallback.")
                raise ValueError("GEMINI_API_KEY is not configured in environment variables.")

        system_instruction = (
            "You are a friendly, knowledgeable senior student and college advisor. "
            "Speak in simple, clear, conversational everyday English just like a helpful human senior or mentor talking to a student. "
            "Never say robotic phrases like 'As an AI language model', 'As UniAssist AI', or 'Regarding your query'. "
            "Give direct, practical, and easy-to-understand advice with clear, simple steps."
        )

        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {"parts": [{"text": question}]}
            ],
            "generationConfig": {
                "temperature": 0.6,
                "maxOutputTokens": 600
            }
        }

        # Models to try in order of priority if a model returns 503 high demand or 404
        candidate_models = [self.model, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]
        tried_models = set()

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            last_error = None
            for model_name in candidate_models:
                if not model_name or model_name in tried_models:
                    continue
                tried_models.add(model_name)

                url = f"{self.base_url}/models/{model_name}:generateContent?key={self.api_key}"
                try:
                    logger.info(f"[Gemini AI] Calling model '{model_name}'...")
                    response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                    
                    # Quota / Rate limit
                    if response.status_code == 429:
                        logger.error("[Gemini AI] HTTP 429 Rate Limit / Quota Exceeded.")
                        raise RuntimeError("Gemini AI API Rate Limit or Quota Exceeded.")

                    # If model is unavailable or 503/404, try next candidate model
                    if response.status_code in (404, 503):
                        logger.warning(f"[Gemini AI] Model '{model_name}' returned {response.status_code}. Trying next model...")
                        last_error = f"HTTP {response.status_code} from {model_name}"
                        continue

                    if response.status_code != 200:
                        logger.error(f"[Gemini AI] API error ({response.status_code}): {response.text}")
                        raise RuntimeError(f"Gemini API error with status {response.status_code}")

                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise RuntimeError("No answer candidates returned from Gemini.")

                    parts = candidates[0].get("content", {}).get("parts", [])
                    if not parts or "text" not in parts[0]:
                        raise RuntimeError("Empty response content from Gemini.")

                    answer = parts[0]["text"].strip()
                    return answer

                except RuntimeError:
                    raise
                except Exception as net_err:
                    logger.warning(f"[Gemini AI] Attempt with '{model_name}' failed: {net_err}")
                    last_error = net_err

            # If all model attempts failed, raise to trigger dataset fallback
            raise RuntimeError(f"All Gemini API model attempts failed: {last_error}")

    async def _generate_mock_ai_response(self, question: str) -> str:
        """
        Human-style simple English responses for testing and demonstrations.
        """
        q = question.lower()
        if "admission" in q or "document" in q or "eligibility" in q:
            return (
                "For admission, you need to keep these documents ready:\n\n"
                "• Your 10th and 12th original mark sheets\n"
                "• Transfer certificate (TC) or migration certificate\n"
                "• Valid ID proof (such as Aadhaar card or Passport)\n"
                "• Entrance exam scorecard and recent passport-size photos\n\n"
                "Make sure to carry the originals along with photocopies during physical counseling."
            )
        elif "exam" in q or "test" in q or "schedule" in q or "admit card" in q or "hall ticket" in q:
            return (
                "Semester exams happen twice a year: odd semester exams take place around November–December, "
                "and even semester exams are held in April–May. You can download your hall ticket from the student portal "
                "about a week before the exams begin. Remember, you need at least 75% attendance to get your hall ticket."
            )
        elif "scholarship" in q or "financial" in q or "fee waiver" in q:
            return (
                "Yes, the university provides multiple scholarship options:\n\n"
                "• Merit scholarships (up to 100% fee waiver for top semester performers)\n"
                "• Sports scholarships for state and national-level athletes\n"
                "• Need-based financial grants for low-income families\n\n"
                "Applications usually open around August or September on the student portal."
            )
        elif "attendance" in q:
            return (
                "You must maintain at least 75% attendance in every course to be allowed to sit for semester exams. "
                "If your attendance is between 65% and 74% because of sickness, submit a medical certificate signed by a doctor "
                "to your HOD within 5 days to get it approved."
            )
        elif "library" in q or "book" in q:
            return (
                "The Central Library is open from 8:00 AM to 10:00 PM on weekdays, and stays open 24 hours during exam weeks. "
                "Undergraduate students can borrow up to 4 books for 14 days with their student ID card. You can also access online research papers from home through EZproxy."
            )
        elif "hostel" in q or "curfew" in q or "room" in q:
            return (
                "Hostel students need to be back inside by 9:30 PM on weekdays and 10:30 PM on weekends. "
                "If you need to stay out for the night, submit an out-pass request on the hostel portal and have your parents confirm it."
            )
        elif "fee" in q or "payment" in q or "installment" in q:
            return (
                "You can pay tuition fees online on the student ERP portal via UPI, debit card, or net banking. "
                "If you need to pay in installments, you can submit an application signed by your parents to the student accounts office before the fee deadline."
            )
        elif "placement" in q or "internship" in q or "job" in q:
            return (
                "Campus placement drives usually start in your final year (7th semester) for students with at least a 6.0–6.5 CGPA and no backlogs. "
                "For internships, you can get a No Objection Certificate (NOC) from your department coordinator after showing your offer letter."
            )
        elif "result" in q or "backlog" in q or "gpa" in q or "cgpa" in q:
            return (
                "Semester results and grade sheets are uploaded to the student portal. If you did not clear a subject, you can register for supplementary backlog exams during the regular exam registration window."
            )
        elif "wifi" in q or "internet" in q:
            return (
                "To connect to campus Wi-Fi, choose 'UniSecure-Student' on your device. Enter your student roll number as the username and your portal password. If you run into issues, visit the IT helpdesk in Block B."
            )
        elif "capabilities" in q or "what can you do" in q:
            return (
                "Here is what I can help you with:\n\n"
                "• Academic Guidance: Attendance rules (75% policy), exam schedules, grading scales & re-evaluation.\n"
                "• Campus Life: Hostel curfews, mess menus, library 24/7 hours, Wi-Fi access & ID cards.\n"
                "• Finance & Careers: Scholarship applications, tuition installment plans, placement drives & internship NOCs.\n"
                "• High Resilience: If our external AI cloud reaches limits, our local 52+ FAQ knowledge base keeps answering without downtime!"
            )
        elif "supplier" in q:
            return (
                "Supplier Analysis & Procurement:\n\n"
                "• We scan approved verified vendor databases for high-grade supplies and competitive wholesale rates.\n"
                "• Volume discounts and university campus procurement standards are prioritized to ensure best pricing."
            )
        elif "material" in q:
            return (
                "Material Selection Recommendation:\n\n"
                "• Based on your structural goals, durability requirements, and budget constraints, optimal materials are selected.\n"
                "• Meets international safety codes and institutional construction / lab compliance standards."
            )
        elif "calculation" in q or "cost" in q:
            return (
                "Cost & Budget Estimation:\n\n"
                "• Provides an itemized breakdown of estimated expenditures, labor, and logistics.\n"
                "• Formats structured summaries ready for project review and administrative approvals."
            )
        else:
            return (
                f"Regarding '{question.strip()}':\n\n"
                "• Check the student portal (ERP) for official notices, rules, and circulars.\n"
                "• For personal or academic queries, you can speak directly with your department mentor or visit the student helpdesk during working hours."
            )


# Singleton instance
ai_service = AIService()
