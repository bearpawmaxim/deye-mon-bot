from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services


def register(app, services: Services):

    @app.route('/api/bots/bots', methods=['POST'])
    @jwt_required()
    def get_bots():
        bots = services.database.get_bots(all=True)
        bots_dict = []
        for bot in bots:
            bot_name = 'Invalid bot token'
            try:
              bot_name = services.telegram.get_bot_info(bot.id).username
            except:
              print(f'Cannot get bot info for bot {bot.id}')
            bots_dict.append({
                'id': bot.id,
                'name': bot_name,
                'token': bot.bot_token,
                'enabled': bot.enabled
            })
        return jsonify(bots_dict)
    
    @app.route('/api/bots/save', methods=['PUT'])
    @jwt_required()
    def save_bot():
        id = request.json.get("id", None)
        token = request.json.get("token", None)
        enabled = request.json.get("enabled", False)
        bot_id = services.database.save_bot(id, token, enabled)
        services.db.session.commit()
        return jsonify({ 'success': True, 'id': bot_id }), 200