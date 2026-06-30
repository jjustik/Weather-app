import os
from email.message import EmailMessage
import aiosmtplib
from dotenv import load_dotenv

load_dotenv()

async def send_reset_email(to_email: str, reset_link: str):
    message = EmailMessage()
    message["From"] = os.getenv("SMTP_USER")
    message["To"] = to_email
    message["Subject"] = "Сброс пароля в Weather App"

    # HTML-версия письма, чтобы ссылка была кликабельной и красивой
    html_content = f"""
    <html>
        <body>
            <h2>Восстановление пароля</h2>
            <p>Вы получили это письмо, потому что запросили сброс пароля для вашего аккаунта.</p>
            <p>Чтобы установить новый пароль, перейдите по ссылке ниже (ссылка действительна 15 минут):</p>
            <p style="margin: 20px 0;">
                <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Сбросить пароль
                </a>
            </p>
            <p>Если вы не запрашивали сброс, просто проигнорируйте это письмо.</p>
        </body>
    </html>
    """
    message.add_alternative(html_content, subtype="html")

    # 2. Подключаемся к SMTP-серверу и отправляем
    await aiosmtplib.send(
        message,
        hostname=os.getenv("SMTP_HOST"),
        port=int(os.getenv("SMTP_PORT")),
        username=os.getenv("SMTP_USER"),
        password=os.getenv("SMTP_PASSWORD"),
        use_tls=True, # Для порта 465 нужен TLS
    )