from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services
from app.utils.key_generation import generate_api_token
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/api/users/users', methods=['POST'])
    @jwt_required()
    def get_users():
        users = services.database.get_users(all=True)
        users_dict = []
        for user in users:
            users_dict.append({
                'id': user.id,
                'name': user.name,
                'isActive': user.is_active,
                'isReporter': user.is_reporter,
                'apiKey': user.api_key,
            })
        return jsonify(users_dict)
    
    @app.route('/api/users/save', methods=['PUT'])
    @jwt_required()
    def save_user():
        id = request.json.get("id", None)
        name = request.json.get("name", None)
        password = request.json.get("password", None)
        is_active = request.json.get("isActive", True)
        is_reporter = request.json.get("isReporter", False)
        
        hashed_password = None
        if password:
            hashed_password = services.authorization._bcrypt.generate_password_hash(password).decode('utf-8')
        
        user_id = services.database.save_user(id, name, hashed_password, is_active, is_reporter)
        services.db.session.commit()
        return jsonify({ 'success': True, 'id': user_id }), 200
    
    @app.route('/api/users/delete/<int:user_id>', methods=['DELETE'])
    @jwt_required()
    def delete_user(user_id: int):
        success = services.database.delete_user(user_id)
        services.db.session.commit()
        return jsonify({ 'success': success }), 200 if success else 404
    
    @app.route('/api/users/generate-token/<int:user_id>', methods=['POST'])
    @jwt_required()
    def generate_token(user_id: int):
        user = services.database.get_user_by_id(user_id)
        if not user:
            return jsonify({ 'success': False, 'error': 'User not found' }), 404
        
        if user.is_reporter:
            jwt_token = services.authorization.create_reporter_token(user.name)
            result = services.database.generate_user_api_token(user_id, jwt_token)
            services.db.session.commit()
            if result:
                return jsonify({ 'success': True, 'token': result }), 200
        else:
            token = generate_api_token()
            result = services.database.generate_user_api_token(user_id, token)
            services.db.session.commit()
            if result:
                return jsonify({ 'success': True, 'token': result }), 200
        
        return jsonify({ 'success': False, 'error': 'Failed to generate token' }), 500
    
    @app.route('/api/users/delete-token/<int:user_id>', methods=['DELETE'])
    @jwt_required()
    def delete_token(user_id: int):
        success = services.database.delete_user_api_token(user_id)
        services.db.session.commit()
        return jsonify({ 'success': success }), 200 if success else 404

