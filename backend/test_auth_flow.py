import asyncio
import os
import sys
from pathlib import Path

# Add project root to sys.path
_current = Path(__file__).resolve().parent
_root = _current.parent
sys.path.insert(0, str(_root))
sys.path.insert(0, str(_current))

from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database.mongodb import db_manager

async def run_tests():
    print("==================================================")
    print("STARTING COMPLETE AUTHENTICATION & CHAT TEST SUITE")
    print("==================================================")

    # Initialize database connection
    await db_manager.connect()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] 1. Health check passed")

        # 2. Register user
        reg_payload = {
            "name": "Aman Yadav",
            "email": "student@gmail.com",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
        res = await client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 200, f"Register failed: {res.text}"
        data = res.json()
        assert data["success"] is True
        assert data["requires_otp"] is True
        print(f"[PASS] 2. Register initiated for student@gmail.com: {data['message']}")

        # Retrieve the OTP record directly to simulate user reading email
        otp_col = db_manager.otp_verifications
        otp_record = await otp_col.find_one({"email": "student@gmail.com", "purpose": "register"})
        assert otp_record is not None, "OTP record not found in database!"
        
        # Test wrong OTP first
        res_bad_otp = await client.post("/api/auth/verify-register-otp", json={
            "email": "student@gmail.com",
            "otp": "000000"
        })
        assert res_bad_otp.status_code == 400
        print("[PASS] 3. Invalid OTP rejected properly with 400")

        # In fallback or real mode, let's create a known OTP for test or extract
        # Let's create an OTP with known code
        from backend.services.otp_service import otp_service
        test_otp = await otp_service.create_otp("student@gmail.com", "register")
        
        # Verify Registration OTP
        res = await client.post("/api/auth/verify-register-otp", json={
            "email": "student@gmail.com",
            "otp": test_otp
        })
        assert res.status_code == 200, f"Verify register OTP failed: {res.text}"
        print("[PASS] 4. Registration OTP verified, student account activated")

        # 5. Login user
        login_payload = {
            "email": "student@gmail.com",
            "password": "Password123!"
        }
        res = await client.post("/api/auth/login", json=login_payload)
        assert res.status_code == 200, f"Login failed: {res.text}"
        login_data = res.json()
        assert login_data["requires_otp"] is True
        print("[PASS] 5. Login initiated, login OTP dispatched")

        # Verify Login OTP
        login_otp = await otp_service.create_otp("student@gmail.com", "login")
        res = await client.post("/api/auth/verify-login-otp", json={
            "email": "student@gmail.com",
            "otp": login_otp
        })
        assert res.status_code == 200, f"Verify login OTP failed: {res.text}"
        verify_data = res.json()
        assert verify_data["user"]["name"] == "Aman Yadav"
        assert "access_token" in res.cookies
        print(f"[PASS] 6. Login OTP verified! JWT cookie issued. Logged in as: {verify_data['user']['name']}")

        # 7. Check /api/auth/me with cookie
        res = await client.get("/api/auth/me", cookies=res.cookies)
        assert res.status_code == 200
        me_data = res.json()
        assert me_data["authenticated"] is True
        assert me_data["user"]["name"] == "Aman Yadav"
        assert me_data["user"]["email"] == "student@gmail.com"
        print(f"[PASS] 7. /api/auth/me returned authenticated student: {me_data['user']['name']} ({me_data['user']['email']})")

        # 8. Send chat message as authenticated student
        chat_res = await client.post("/api/chat", json={"question": "What is the minimum attendance requirement?"}, cookies=res.cookies)
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["success"] is True
        print(f"[PASS] 8. Authenticated chat answered: {chat_data['answer'][:60]}... (Source: {chat_data['source']})")

        # 9. Fetch chat history from MongoDB
        hist_res = await client.get("/api/chat/history", cookies=res.cookies)
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert hist_data["success"] is True
        assert len(hist_data["history"]) >= 1
        print(f"[PASS] 9. Chat history retrieved from MongoDB: {len(hist_data['history'])} message(s) saved")

        # 10. Test Logout
        logout_res = await client.post("/api/auth/logout", cookies=res.cookies)
        assert logout_res.status_code == 200
        print("[PASS] 10. Logout successful")

        # Check me after logout
        post_logout_me = await client.get("/api/auth/me")
        assert post_logout_me.json()["authenticated"] is False
        print("[PASS] 11. Post-logout /api/auth/me confirmed unauthenticated")

        # 12. Test Forgot Password & Reset
        fp_res = await client.post("/api/auth/forgot-password", json={"email": "student@gmail.com"})
        assert fp_res.status_code == 200
        reset_otp = await otp_service.create_otp("student@gmail.com", "forgot_password")
        
        reset_res = await client.post("/api/auth/reset-password", json={
            "email": "student@gmail.com",
            "otp": reset_otp,
            "new_password": "NewSecretPassword456!",
            "confirm_password": "NewSecretPassword456!"
        })
        assert reset_res.status_code == 200
        print("[PASS] 12. Password reset successfully completed")

        # Verify login with new password
        login_new = await client.post("/api/auth/login", json={
            "email": "student@gmail.com",
            "password": "NewSecretPassword456!"
        })
        assert login_new.status_code == 200
        print("[PASS] 13. Successfully authenticated with NEW password!")

    print("==================================================")
    print("ALL 13 AUTOMATED AUTH & CHAT TESTS PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
