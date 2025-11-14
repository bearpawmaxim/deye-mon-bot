from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import Services
from app.utils.jwt_decorators import jwt_required_reporter_only, jwt_required


def register(app, services: Services):

    @app.route('/api/ext-data/list', methods=['GET'])
    @jwt_required()
    def get_ext_data_list():
        data_list = services.database.get_ext_data()
        result = []
        for data in data_list:
            result.append({
                'user': data.user.name if data.user else None,
                'grid_state': data.grid_state,
                'received_at': data.received_at.isoformat() if data.received_at else None
            })
        return jsonify(result)

    @app.route('/api/ext-data/grid-power', methods=['POST'])
    @jwt_required_reporter_only()
    def update_grid_power():
        try:
            data = request.json
            if not data or 'grid_power' not in data:
                return jsonify({'error': 'Invalid data format'}), 400
            
            grid_power = data.get('grid_power', {})
            grid_state = grid_power.get('state', False)
            
            user = get_jwt_identity()
            
            data_id = services.database.update_ext_data_grid_state(
                user=user,
                grid_state=grid_state
            )
            
            if data_id is None:
                return jsonify({'error': 'Failed to update data state'}), 500
            
            services.db.session.commit()
            
            return jsonify({'status': 'ok'}), 200
            
        except Exception as e:
            services.db.session.rollback()
            print(f"Error updating grid power: {e}")
            return jsonify({'error': 'Internal server error'}), 500

