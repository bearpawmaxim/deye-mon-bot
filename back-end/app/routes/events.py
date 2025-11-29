import json
from flask import Response
from shared import BoundedQueue
from app.services import Services, EventItem
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def register(app, services: Services):
    @app.route("/api/events")
    def events():
        q = BoundedQueue(maxsize=100)

        is_authenticated = False
        user = None
        if verify_jwt_in_request(optional=True) is not None:
            user = get_jwt_identity()
            is_authenticated = user is not None

        services.events.add_public_client(q)
        if is_authenticated:
            services.events.add_private_client(q)

        def stream():
            try:
                while True:
                    event = q.get()
                    if event is None:
                        break
                    if event.private and not is_authenticated:
                        break

                    if user is not None:
                        event.user = user

                    yield f"data: {json.dumps(event.to_dict())}\n\n"
            finally:
                services.events.remove_client(q)

        return Response(stream(), mimetype="text/event-stream")