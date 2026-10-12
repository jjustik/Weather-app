import stripe
from typing import Annotated
from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.config import settings
from app.db import get_async_session
from app.utils.auth import get_current_user
from app.models import User as UserModel, Payment, ProceedWebhookEvent
from app.exceptions import InvalidStripeSignatureException, InvalidCoinPackageException

stripe.api_key = settings.stripe_secret_key

router = APIRouter(prefix="/payment", tags=["Payment"])

COIN_PACKAGES = {
    "coins_1000": settings.stripe_price_coins_1000,
    "coins_5000": settings.stripe_price_coins_5000,
    "coins_10000": settings.stripe_price_coins_10000,
}


@router.post("/checkout/coins/{package}")
async def create_coins_checkout(
    package: str,
    current_user: Annotated[UserModel, Depends(get_current_user)]
) -> dict:
    if package not in COIN_PACKAGES:
        raise InvalidCoinPackageException(package)

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": COIN_PACKAGES[package]["price_id"], "quantity": 1}],
        success_url="https://justik-weather.vercel.app/success",
        cancel_url="https://justik-weather.vercel.app/cancel",
        client_reference_id=str(current_user.id),
        metadata={"package": package, "type": "coins"},
    )

    logger.info(f"Checkout session created for user {current_user.id}, package {package}")
    return {"checkout_url": session.url}


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_async_session)],
) -> dict:
    
    payload = request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except stripe.error.SignatureVerificationError:
        logger.warning("Invalid Stripe Webhook signature recieved")
        return InvalidStripeSignatureException

    existing = await session.execute(
        select(ProceedWebhookEvent).where(ProceedWebhookEvent.stripe_event_id == event[id])
    )

    if existing.scalar_one_or_none():
        return {"status": "ok"}

    if event["type"] == "checkout.session.completed":
        data = event["data"]["object"]
        user_id = data["client_reference_id"]
        package = data["metadata"]["package"]
        coins = COIN_PACKAGES[package]["coins"]

        result = await session.execute(select(UserModel).where(UserModel.id == user_id))
        user = result.scalar_one_or_none()

    if user:
        user.coins_balance += coins
        session.add(Payment(
            user_id=user_id,
            stripe_session_id=data["id"],
            type="coins",
            amount=data["amount_total"] / 100,
            status="completed"
        ))
        logger.info(f"Added {coins} coins to user {user.id}")

    session.add(ProceedWebhookEvent(stripe_event_id=event["id"]))
    await session.commit()

    return {"status": "ok"}