from flask import Response, stream_with_context
from queue import Queue
import json
from shared.services import EventsService, EventItem
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def register(app, events: EventsService):
    @app.route("/api/events/public")
    def sse_public():
        q: "Queue[EventItem]" = Queue(maxsize=10)
        events.add_public_client(q)

        def generator():
            try:
                while True:
                    event = q.get()
                    yield f"data: {json.dumps(event.to_dict())}\n\n"
            except GeneratorExit:
                events.events.remove_client(q)

        return Response(stream_with_context(generator()), mimetype="text/event-stream")

    @app.route("/api/events/private")
    def sse_private():
        verify_jwt_in_request()
        user_name = get_jwt_identity()

        q: "Queue[EventItem]" = Queue(maxsize=10)
        events.events.add_private_client(q)

        def generator():
            try:
                while True:
                    event = q.get()
                    event.user = user_name
                    yield f"data: {json.dumps(event.to_dict())}\n\n"
            except GeneratorExit:
                events.events.remove_client(q)

        return Response(stream_with_context(generator()), mimetype="text/event-stream")
