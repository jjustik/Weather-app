import os
from email.message import EmailMessage
import aiosmtplib
from dotenv import load_dotenv

load_dotenv()

async def send_reset_email(to_email: str, reset_link: str):
    message = EmailMessage()
    message["From"] = os.getenv("SMTP_USER")
    message["To"] = to_email
    message["Subject"] = "Password Reset for Weather App"

    html_content = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You are receiving this email because you requested a password reset for your account.</p>
            <p>To set up a new password, please click the link below (this link is valid for 15 minutes):</p>
            <p style="margin: 20px 0;">
                <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Reset Password
                </a>
            </p>
            <p>If you did not request a password reset, please ignore this email.</p>
        </body>
    </html>
    """
    message.add_alternative(html_content, subtype="html")

    await aiosmtplib.send(
        message,
        hostname=os.getenv("SMTP_HOST"),
        port=int(os.getenv("SMTP_PORT")),
        username=os.getenv("SMTP_USER"),
        password=os.getenv("SMTP_PASSWORD"),
        use_tls=True,
    )