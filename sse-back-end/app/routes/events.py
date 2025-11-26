import json
from queue import Queue
from flask import Response, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from shared.services import EventItem, EventsService

def register(app, events_service: EventsService):
    @app.route("/api/events")
    def events():
        q: "Queue[EventItem]" = Queue()

        user = None
        is_authenticated = False
        if verify_jwt_in_request(optional=True) is not None:
            user = get_jwt_identity()
            is_authenticated = user is not None

        events_service.add_public_client(q)
        if is_authenticated:
            events_service.add_private_client(q)

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
                events_service.remove_client(q)

        return Response(stream(), mimetype="text/event-stream")
