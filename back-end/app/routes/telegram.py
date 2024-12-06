from flask import request
from app.services import Services


def register(app, services: Services):

    @app.route('/api/tg_callback', methods=["GET", "POST"])
    def tg_callback():
        try:
            if request.method == "POST":
                print(request.json)
                services.bot.update(request.json)
        except Exception as e:
            print(f'Error processing request: {e}')
        finally:
            return { "ok": True }