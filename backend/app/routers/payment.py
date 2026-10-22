from datetime import datetime, timezone
from typing import Annotated

import stripe
from fastapi import APIRouter, Depends, Request
from loguru import logger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_async_session
from app.exceptions import (
    AlreadyPremiumException,
    InvalidCoinPackageException,
    InvalidStripeSignatureException,
)
from app.models.user import (
    User as UserModel,
    Subscription,
    Payment,
    ProceedWebhookEvent,
)
from app.utils.auth import get_current_user

stripe.api_key = settings.stripe_secret_key

PREMIUM_STATUSES = {"active", "trialing", "past_due"}

def get_period_end(sub: dict) -> datetime:
    timestamp = sub.get("current_period_end")
    if timestamp is None:
        timestamp = sub["items"]["data"][0]["current_period_end"]
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).replace(tzinfo=None)


async def sync_subscription(session: AsyncSession, sub: dict) -> None:
    result = await session.execute(
        select(UserModel).where(UserModel.stripe_customer_id == sub["customer"])
    )
    user = result.scalar_one_or_none()

    if not user:
        logger.warning(f"Subscription event for unknown customer {sub['customer']}")
        return

    result = await session.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == sub["id"])
    )
    db_sub = result.scalar_one_or_none()

    if db_sub is None:
        db_sub = Subscription(user_id=user.id, stripe_subscription_id=sub["id"])
        session.add(db_sub)

    db_sub.status = sub["status"]
    db_sub.current_period_end = get_period_end(sub)
    user.is_premium = sub["status"] in PREMIUM_STATUSES

    logger.info(f"Subscription {sub['id']} -> {sub['status']}, is_premium={user.is_premium}")

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

    session = stripe.checkout.Session.create_async(
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
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except stripe.SignatureVerificationError:
        logger.warning("Invalid Stripe webhook signature received")
        raise InvalidStripeSignatureException()

    existing = await session.execute(
        select(ProceedWebhookEvent).where(ProceedWebhookEvent.stripe_event_id == event["id"])
    )
    if existing.scalar_one_or_none():
        return {"status": "ok"}

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed" and data.get("mode") == "payment":
        user_id = data["client_reference_id"]
        package = data["metadata"]["package"]
        coins = COIN_PACKAGES[package]["coins"]

        result = await session.execute(select(UserModel).where(UserModel.id == user_id))
        user = result.scalar_one_or_none()

        if user:
            if user.is_premium:
                coins = coins * 110 // 100  # +10% для премиума

            user.coins_balance += coins
            session.add(Payment(
                user_id=user.id,
                stripe_session_id=data["id"],
                type="coins",
                amount=data["amount_total"] / 100,
                status="completed",
            ))
            logger.info(f"Added {coins} coins to user {user.id}")

    elif event_type in (
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ):
        await sync_subscription(session, data)

    session.add(ProceedWebhookEvent(stripe_event_id=event["id"]))
    await session.commit()

    return {"status": "ok"}


@router.post("/chechkout/premium")
async def create_premium_checkout(
    current_user: Annotated[UserModel, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_async_session)]
):
    if current_user.is_premium:
        raise AlreadyPremiumException()

    if not current_user.stripe_customer_id:
        customer = await stripe.Customer.create_async(
            email=current_user.email,
            metadata={"user_id": str(current_user.id)}
        )
        current_user.stripe_customer_id = customer.id
        await session.commit()

        checkout = await stripe.checkout.Session.create_async(
        mode="subscription",
        customer=current_user.stripe_customer_id,
        line_items=[{"price": settings.stripe_price_premium, "quantity": 1}],
        success_url="https://justik-weather.vercel.app/success",
        cancel_url="https://justik-weather.vercel.app/cancel",
        client_reference_id=str(current_user.id),
        metadata={"type": "premium"},
    )

    logger.info(f"Premium checkout created for user {current_user.id}")
    return {"checkout_url": checkout.url}