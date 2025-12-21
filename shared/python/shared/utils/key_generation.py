from datetime import datetime, timedelta, timezone
import random
import string
import secrets


def generate_secret_key(length: int = 32):
    return ''.join(random.choice(string.ascii_lowercase) for i in range(length))

def generate_api_token(length: int = 64):
    """Generate a secure API token for user authentication"""
    alphabet = string.ascii_letters + string.digits + '-_'
    return ''.join(secrets.choice(alphabet) for i in range(length))

def generate_password_reset_token(expire_hourse: int):
    password_reset_token = secrets.token_urlsafe(64)
    reset_token_expiration = (
        datetime.now(timezone.utc) + timedelta(hours=expire_hourse)
    )
    return password_reset_token, reset_token_expiration
