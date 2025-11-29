from flask import Blueprint, jsonify
import requests

blueprint = Blueprint('app_info', __name__, url_prefix='/api/app')

FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/svitlo-power/databases/(default)/documents/sites/app'

@blueprint.route('/info', methods=['GET'])
def get_app_info():
    try:
        response = requests.get(FIRESTORE_URL, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        fields = data.get('fields', {})
        
        update_url = fields.get('updateUrl', {}).get('stringValue', '')
        version = fields.get('ver', {}).get('stringValue', '')
        
        return jsonify({
            'updateUrl': update_url,
            'version': version
        }), 200
        
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Failed to fetch app information',
            'message': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


def register(app, services):
    app.register_blueprint(blueprint)

