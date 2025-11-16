from datetime import date
from flask import jsonify, request
from app.services import Services
from app.models import VisitCounter, DailyVisitCounter

def register(app, services: Services):

    @app.route('/api/visit/add', methods=["POST"])
    def visit():
        visit_type = request.args.get("type")
        visit_date = request.args.get("date")

        # delegate to visit counter service
        services.visit_counter.add_visit(visit_type, visit_date)
        services.db.session.commit()

        return jsonify({ "success": True })

    @app.route("/api/visit/stats", methods=["GET"])
    def stats():
        return jsonify(services.visit_counter.get_today_stats())
