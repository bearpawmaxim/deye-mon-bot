from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import Services, EventItem
from app.utils.jwt_decorators import jwt_required_reporter_only, jwt_required
from datetime import datetime, timezone


def register(app, services: Services):

    @app.route('/api/ext-data/list', methods=['GET'])
    @jwt_required()
    def get_ext_data_list():
        data_list = services.database.get_ext_data()
        result = []
        for data in data_list:
            result.append({
                'id': data.id,
                'user': data.user.name if data.user else None,
                'user_id': data.user_id,
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
            services.events.broadcast_public("ext_data_updated")

            return jsonify({'status': 'ok'}), 200
            
        except Exception as e:
            services.db.session.rollback()
            print(f"Error updating grid power: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/ext-data/create', methods=['POST'])
    @jwt_required()
    def create_ext_data():
        try:
            data = request.json
            if not data:
                return jsonify({'error': 'Invalid data format'}), 400
            
            user_id = data.get('user_id')
            grid_state = data.get('grid_state')
            received_at_str = data.get('received_at')
            
            if user_id is None or grid_state is None:
                return jsonify({'error': 'user_id and grid_state are required'}), 400
            
            received_at = None
            if received_at_str:
                try:
                    received_at = datetime.fromisoformat(received_at_str.replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'error': 'Invalid received_at format'}), 400
            
            data_id = services.database.create_ext_data_manual(
                user_id=user_id,
                grid_state=grid_state,
                received_at=received_at
            )
            
            if data_id is None:
                return jsonify({'error': 'Failed to create ext_data'}), 500
            
            services.db.session.commit()
            services.events.broadcast_public("ext_data_updated")
            
            return jsonify({'status': 'ok', 'id': data_id}), 201
            
        except Exception as e:
            services.db.session.rollback()
            print(f"Error creating ext data: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/ext-data/delete/<int:data_id>', methods=['DELETE'])
    @jwt_required()
    def delete_ext_data(data_id):
        try:
            success = services.database.delete_ext_data_by_id(data_id)
            
            if not success:
                return jsonify({'error': 'Ext_data not found or failed to delete'}), 404
            
            services.db.session.commit()
            services.events.broadcast_public("ext_data_updated")
            
            return jsonify({'status': 'ok'}), 200
            
        except Exception as e:
            services.db.session.rollback()
            print(f"Error deleting ext data: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/ext-data/<int:data_id>', methods=['GET'])
    @jwt_required()
    def get_ext_data_by_id(data_id):
        try:
            data = services.database.get_ext_data_by_id(data_id)
            
            if not data:
                return jsonify({'error': 'Ext_data not found'}), 404
            
            result = {
                'id': data.id,
                'user': data.user.name if data.user else None,
                'user_id': data.user_id,
                'grid_state': data.grid_state,
                'received_at': data.received_at.isoformat() if data.received_at else None
            }
            
            return jsonify(result), 200
            
        except Exception as e:
            print(f"Error getting ext data by id: {e}")
            return jsonify({'error': 'Internal server error'}), 500

