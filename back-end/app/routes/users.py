from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import Services
from shared.utils import generate_api_token
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):

    @app.route('/api/users/users', methods=['POST'])
    @jwt_required()
    def get_users():
        current_user = get_jwt_identity()
        users = services.database.get_users(all=True)
        users_dict = []
        for user in users:
            if user.name != current_user:
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
        
        reset_token = None
        if not id and user_id and not is_reporter:
            user = services.database.get_user_by_id(user_id)
            if user:
                reset_token = services.authorization._generate_passwd_reset_token(user, hours=2.5)
        
        return jsonify({ 
            'success': True, 
            'id': user_id,
            'resetToken': reset_token
        }), 200
    
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

