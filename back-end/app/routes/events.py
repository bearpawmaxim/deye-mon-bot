from flask import Response, stream_with_context, request
from queue import Queue
import json
from app.services import Services, EventItem
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

def register(app, services: Services):
    @app.route("/api/events")
    def sse_stream():
        verify_jwt_in_request(optional=True)
        user_name = get_jwt_identity()
        is_authenticated = user_name is not None
        q: "Queue[EventItem]" = Queue(maxsize=10)
        services.events.add_client(q, is_authenticated)

        def generator():
            try:
                while True:
                    event = q.get()
                    print(f"uthed: {is_authenticated}, type: {event}")
                    if is_authenticated and user_name is not None:
                        event.user = user_name
                    yield f"data: {json.dumps(event.to_dict())}\n\n"
            except GeneratorExit:
                services.events.remove_client(q)

        return Response(stream_with_context(generator()), mimetype="text/event-stream")
