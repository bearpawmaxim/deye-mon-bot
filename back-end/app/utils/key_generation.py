import random
import string


def generate_secret_key(length: int = 32):
    return ''.join(random.choice(string.ascii_lowercase) for i in range(length))