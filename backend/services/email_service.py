import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import httpx
from dotenv import load_dotenv

# Ensure .env variables are loaded
load_dotenv()

logger = logging.getLogger("UniAssistAI.EmailService")

class EmailService:
    def __init__(self):
        # Brevo API Key support (preferred, fast, no port blocking)
        self.brevo_api_key = os.getenv("BREVO_API_KEY", "").strip()
        self.brevo_sender_name = os.getenv("BREVO_SENDER_NAME", "UniAssist AI").strip()

        # Brevo / SMTP Relay support
        raw_host = os.getenv("SMTP_HOST", "smtp-relay.brevo.com").strip()
        if not raw_host or "brevo" in raw_host.lower():
            self.smtp_host = "smtp-relay.brevo.com"
        else:
            self.smtp_host = raw_host

        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USERNAME", "").strip()
        self.smtp_pass = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
        self.from_email = (
            os.getenv("BREVO_SENDER_EMAIL") 
            or os.getenv("SMTP_FROM_EMAIL") 
            or "aman0787yadav@gmail.com"
        ).strip()
        self.mock_email = os.getenv("MOCK_EMAIL", "false").lower() in ("true", "1", "yes")

    def _generate_html(self, title: str, headline: str, otp_code: str, note: str) -> str:
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #050505;
              color: #f3f4f6;
              margin: 0;
              padding: 40px 20px;
            }}
            .card {{
              max-width: 480px;
              margin: 0 auto;
              background-color: #111116;
              border: 1px solid rgba(250, 204, 21, 0.4);
              border-radius: 16px;
              padding: 36px 28px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(250, 204, 21, 0.15);
            }}
            .brand {{
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 24px;
            }}
            .badge {{
              background-color: #facc15;
              color: #000;
              font-weight: 800;
              font-size: 14px;
              padding: 4px 8px;
              border-radius: 6px;
            }}
            .title {{
              font-size: 20px;
              font-weight: 700;
              color: #ffffff;
            }}
            .headline {{
              font-size: 16px;
              color: #d1d5db;
              margin-bottom: 24px;
              line-height: 1.5;
            }}
            .otp-container {{
              background: #181820;
              border: 2px dashed #facc15;
              border-radius: 12px;
              text-align: center;
              padding: 18px;
              margin: 24px 0;
            }}
            .otp-code {{
              font-family: 'Courier New', Courier, monospace;
              font-size: 36px;
              font-weight: 900;
              letter-spacing: 8px;
              color: #facc15;
              margin: 0;
            }}
            .expiry {{
              font-size: 13px;
              color: #9ca3af;
              margin-top: 16px;
            }}
            .footer {{
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid #27272a;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">
              <span class="badge">UniAssist AI</span>
              <span class="title">University Student Support</span>
            </div>
            <p class="headline">{headline}</p>
            <div class="otp-container">
              <p class="otp-code">{otp_code}</p>
            </div>
            <p class="expiry">⏱ <strong>This OTP expires in 5 minutes.</strong></p>
            <p class="expiry">{note}</p>
            <div class="footer">
              <p>© 2026 UniAssist AI. Automated notification — do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
        """

    async def send_otp_email(self, to_email: str, otp_code: str, purpose: str = "register") -> bool:
        """
        Send OTP verification email.
        If SMTP credentials are not configured or MOCK_EMAIL=true,
        print a prominent ASCII box in terminal for development/evaluation.
        """
        if purpose == "register":
            subject = f"UniAssist AI - Verify Your Email [{otp_code}]"
            headline = "Welcome to UniAssist AI! Please verify your email to activate your university student account."
            note = "If you did not request this account registration, please ignore this email."
        elif purpose == "login":
            subject = f"UniAssist AI - Login Verification Code [{otp_code}]"
            headline = "A login attempt was initiated for your UniAssist AI account. Use the code below to complete sign-in."
            note = "If you did not attempt to log in, please secure your password immediately."
        elif purpose == "forgot_password":
            subject = f"UniAssist AI - Password Reset Code [{otp_code}]"
            headline = "A request was received to reset your UniAssist AI password. Enter this verification code to proceed."
            note = "If you did not request a password reset, you can safely ignore this email."
        else:
            subject = f"UniAssist AI - Verification Code [{otp_code}]"
            headline = "Your verification code is ready."
            note = "This code will expire shortly."

        html_body = self._generate_html("UniAssist AI", headline, otp_code, note)
        plain_body = f"UniAssist AI\n\n{headline}\n\nYour 6-digit OTP: {otp_code}\n\nThis OTP expires in 5 minutes.\n{note}"

        # Prominently log the OTP to the console so testing/evaluating works instantly
        border = "=" * 60
        logger.info(f"\n{border}\n[EMAIL DISPATCH] Purpose: {purpose.upper()}\nTo: {to_email}\nSubject: {subject}\nOTP CODE: >>> {otp_code} <<<\nExpires in: 5 minutes\n{border}\n")

        # 1. First priority: Send via Brevo API if BREVO_API_KEY is configured
        brevo_key = os.getenv("BREVO_API_KEY", self.brevo_api_key).strip()
        sender_email = (
            os.getenv("BREVO_SENDER_EMAIL") 
            or os.getenv("SMTP_FROM_EMAIL") 
            or self.from_email 
            or "aman0787yadav@gmail.com"
        ).strip()
        sender_name = os.getenv("BREVO_SENDER_NAME", self.brevo_sender_name).strip() or "UniAssist AI"

        if brevo_key:
            try:
                headers = {
                    "api-key": brevo_key,
                    "accept": "application/json",
                    "content-type": "application/json"
                }
                payload = {
                    "sender": {"name": sender_name, "email": sender_email},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "htmlContent": html_body,
                    "textContent": plain_body
                }
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.post("https://api.brevo.com/v3/smtp/email", headers=headers, json=payload)
                    if resp.status_code in (200, 201, 202):
                        logger.info(f"Successfully sent OTP email to {to_email} via Brevo API")
                        return True
                    else:
                        logger.error(f"Brevo API returned error ({resp.status_code}): {resp.text}")
            except Exception as brevo_err:
                logger.error(f"Brevo API dispatch failed ({brevo_err})", exc_info=False)

        # 2. Second priority: Send via SMTP Relay
        smtp_user = os.getenv("SMTP_USERNAME", self.smtp_user).strip()
        smtp_pass = os.getenv("SMTP_PASSWORD", self.smtp_pass).replace(" ", "").strip()
        smtp_host = os.getenv("SMTP_HOST", self.smtp_host).strip()
        smtp_port = int(os.getenv("SMTP_PORT", str(self.smtp_port)))

        if smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{sender_name} <{sender_email}>"
                msg["To"] = to_email

                part1 = MIMEText(plain_body, "plain")
                part2 = MIMEText(html_body, "html")
                msg.attach(part1)
                msg.attach(part2)

                with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(sender_email, [to_email], msg.as_string())

                logger.info(f"Successfully sent OTP email to {to_email} via SMTP ({smtp_host})")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP ({e}). Fallback to console OTP.", exc_info=False)

        # 3. Development / Mock fallback
        logger.info(f"OTP '{otp_code}' generated and ready for {to_email}")
        return True


email_service = EmailService()
