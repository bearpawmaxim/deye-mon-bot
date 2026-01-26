import asyncio
import logging

from app.main import run

if __name__ == "__main__":
    try:
        asyncio.run(run())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Application terminated gracefully")
        raise SystemExit(0)
