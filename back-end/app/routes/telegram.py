from flask import request
from app.services import Services


def register(app, services: Services):

    @app.route('/api/tg/callback/<bot_id>', methods=["GET", "POST"])
    def tg_callback(bot_id: str):
        try:
            if request.method == "POST":
                print(request.json)
                services.bot.update(bot_id, request.json)
        except Exception as e:
            print(f'Error processing request: {e}')
        finally:
            return { "ok": True }