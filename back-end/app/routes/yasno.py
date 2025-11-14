from flask import jsonify, request
from app.services import Services
import requests


def register(app, services: Services):

    @app.route('/api/yasno/planned-outages', methods=['GET'])
    def get_planned_outages():
        """
        Proxy endpoint for fetching planned outages data from YASNO API.
        This endpoint bypasses CORS restrictions by making the request server-side.
        """
        try:
            region = request.args.get('region', '25')
            dso = request.args.get('dso', '902')
            
            yasno_url = f"https://app.yasno.ua/api/blackout-service/public/shutdowns/regions/{region}/dsos/{dso}/planned-outages"
            
            response = requests.get(
                yasno_url,
                timeout=10,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                }
            )
            
            if not response.ok:
                return jsonify({
                    'error': f'Failed to fetch data from YASNO API. Status: {response.status_code}'
                }), response.status_code
            
            return jsonify(response.json()), 200
            
        except requests.exceptions.Timeout:
            return jsonify({
                'error': 'Request to YASNO API timed out'
            }), 504
            
        except requests.exceptions.RequestException as e:
            return jsonify({
                'error': f'Failed to fetch data from YASNO API: {str(e)}'
            }), 500
            
        except Exception as e:
            return jsonify({
                'error': f'Internal server error: {str(e)}'
            }), 500

