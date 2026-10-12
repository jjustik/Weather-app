import os
import aioboto3

from app.config import settings

async def upload_file_to_r2(file_bytes: bytes, filename: str, content_type: str) -> str:
    session = aioboto3.Session()

    async with session.client(
        "s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.r2_access_key,
        aws_secret_access_key=settings.r2_secret_key,
    ) as s3_client:
        await s3_client.put_object(
            Bucket=settings.r2_bucket_name,
            Key=filename,
            Body=file_bytes,
            ContentType=content_type,
        )

    domain = settings.r2_public_custom_domain.rstrip("/")
    return f"{domain}/{filename}"


async def delete_file_from_r2(filename: str) -> None:
    session = aioboto3.Session()

    async with session.client(
        "s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.r2_access_key,
        aws_secret_access_key=settings.r2_secret_key,
    ) as s3_client:
        await s3_client.delete_object(
            Bucket=settings.r2_bucket_name,
            Key=filename,
        )