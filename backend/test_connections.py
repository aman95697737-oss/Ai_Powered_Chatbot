import os
import sys
import asyncio
import smtplib
from dotenv import load_dotenv

# Load backend/.env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path)

print("=" * 60)
print("TESTING PROJECT CONFIGURATION & CONNECTIONS")
print("=" * 60)

# 1. TEST MONGODB
print("\n[1/3] Testing MongoDB Atlas Connection...")
mongodb_uri = os.getenv("MONGODB_URI")
db_name = os.getenv("DATABASE_NAME", "university_chatbot")

# Mask password in URI for logging
masked_uri = mongodb_uri
if "@" in masked_uri:
    parts = masked_uri.split("@")
    masked_uri = parts[0].split("://")[0] + "://***:***@" + parts[1]

print(f"URI: {masked_uri}")
print(f"Database: {db_name}")

from motor.motor_asyncio import AsyncIOMotorClient

async def test_mongo():
    try:
        client = AsyncIOMotorClient(mongodb_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        res = await client.admin.command('ping')
        print(f"[PASS] MongoDB Atlas connected successfully! Ping result: {res}")
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"[PASS] Collections in '{db_name}': {collections}")
        client.close()
        return True
    except Exception as e:
        print(f"[FAIL] MongoDB connection failed: {e}")
        return False

# 2. TEST BREVO EMAIL SERVICE
async def test_brevo():
    print("\n[2/3] Testing Brevo Email Service...")
    import httpx
    brevo_api_key = os.getenv("BREVO_API_KEY", "").strip()
    if brevo_api_key:
        masked_k = brevo_api_key[:8] + "..." + brevo_api_key[-4:] if len(brevo_api_key) > 12 else "Present"
        print(f"Testing Brevo API with key: {masked_k}")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"api-key": brevo_api_key, "accept": "application/json"}
                resp = await client.get("https://api.brevo.com/v3/account", headers=headers)
                if resp.status_code == 200:
                    email_acc = resp.json().get("email", "Verified")
                    print(f"[PASS] Brevo API authenticated successfully! Account: {email_acc}")
                    return True
                else:
                    print(f"[FAIL] Brevo API authentication error ({resp.status_code}): {resp.text[:200]}")
                    return False
        except Exception as e:
            print(f"[FAIL] Brevo API connection failed: {e}")
            return False

    # Otherwise test Brevo SMTP Relay
    host = os.getenv("SMTP_HOST", "smtp-relay.brevo.com").strip()
    port = int(os.getenv("SMTP_PORT", 587))
    user = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
    
    print(f"Host: {host}:{port}, User: {user}")
    try:
        with smtplib.SMTP(host, port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            print(f"[PASS] Brevo SMTP Relay login successful!")
            return True
    except Exception as e:
        print(f"[FAIL] Brevo SMTP Relay authentication failed: {e}")
        return False

# 3. TEST AI API (GEMINI / OPENAI)
async def test_ai():
    print("\n[3/3] Testing AI Service Connection...")
    import httpx
    gemini_key = os.getenv("GEMINI_API_KEY")
    ai_key = os.getenv("AI_API_KEY")
    
    if gemini_key:
        model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
        base_url = os.getenv("GEMINI_API_URL", "https://generativelanguage.googleapis.com/v1beta").rstrip("/")
        masked_key = gemini_key[:8] + "..." + gemini_key[-4:] if len(gemini_key) > 12 else "Present"
        print(f"Provider: Google Gemini AI, Model: {model}, Key: {masked_key}")
        try:
            url = f"{base_url}/models/{model}:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": "Hello, please reply with 'READY'"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 20}
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if resp.status_code == 200:
                    data = resp.json()
                    ans = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    print(f"[PASS] Gemini AI API responded successfully: {ans}")
                    return True
                else:
                    print(f"[FAIL] Gemini API returned status {resp.status_code}: {resp.text[:200]}")
                    return False
        except Exception as e:
            print(f"[FAIL] Gemini API call failed: {e}")
            return False
    elif ai_key:
        api_url = os.getenv("AI_API_URL", "https://api.openai.com/v1/chat/completions")
        model = os.getenv("AI_MODEL", "gpt-4o-mini")
        masked_key = ai_key[:8] + "..." + ai_key[-4:] if len(ai_key) > 12 else "None"
        print(f"Provider: OpenAI, Model: {model}, Key: {masked_key}")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                headers = {"Authorization": f"Bearer {ai_key}", "Content-Type": "application/json"}
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": "Respond with 'READY'"}],
                    "max_tokens": 10
                }
                resp = await client.post(api_url, headers=headers, json=payload)
                if resp.status_code == 200:
                    answer = resp.json()["choices"][0]["message"]["content"]
                    print(f"[PASS] OpenAI API responded successfully: {answer.strip()}")
                    return True
                else:
                    print(f"[FAIL] OpenAI API responded with status {resp.status_code}: {resp.text}")
                    return False
        except Exception as e:
            print(f"[FAIL] OpenAI API call failed: {e}")
            return False
    else:
        print("[SKIP] No GEMINI_API_KEY or AI_API_KEY found in .env (Mock/Dataset Fallback will be used)")
        return True

async def main():
    m_ok = await test_mongo()
    b_ok = await test_brevo()
    a_ok = await test_ai()
    print("\n" + "=" * 60)
    print(f"SUMMARY: MongoDB: {'OK' if m_ok else 'FAIL'}, Brevo Email: {'OK' if b_ok else 'FAIL'}, AI: {'OK' if a_ok else 'FAIL'}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
