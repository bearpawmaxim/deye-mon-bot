from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def jwt_required_reporter_only():
    """
    This decorator should be used only for reporter-specific endpoints !!!.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            
            if not claims.get('is_reporter', False):
                return jsonify({
                    'error': 'This endpoint is only accessible for reporter users'
                }), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def jwt_required():

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            
            # Block access if user is a reporter
            if claims.get('is_reporter', False):
                return jsonify({
                    'error': 'Reporter users can only access /api/ext-data/grid-power endpoint'
                }), 403
            
            return fn(*args, **kwargs)
        return decorator
    return wrapper

