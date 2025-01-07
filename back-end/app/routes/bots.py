from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services


def register(app, services: Services):

    @app.route('/api/bots/bots', methods=['POST'])
    @jwt_required()
    def get_bots():
        bots = services.database.get_bots(all=True)

        def process_bot(bot):
            bot_name = 'Invalid bot token'
            try:
                bot_name = services.telegram.get_bot_info(bot.id).username
            except:
                print(f'Cannot get bot info for bot {bot.id}')
            return {
                'id': bot.id,
                'name': bot_name,
                'token': bot.bot_token,
                'enabled': bot.enabled,
                'hookEnabled': bot.hook_enabled,
            }

        futures = [services.executor.submit(process_bot, bot) for bot in bots]
        bots_dict = [future.result() for future in futures]

        return jsonify(bots_dict)
    
    @app.route('/api/bots/save', methods=['PUT'])
    @jwt_required()
    def save_bot():
        id = request.json.get("id", None)
        token = request.json.get("token", None)
        enabled = request.json.get("enabled", False)
        hook_enabled = request.json.get("hookEnabled", False)
        bot_id = services.database.save_bot(id, token, enabled, hook_enabled)
        services.db.session.commit()
        if enabled:
            services.telegram.add_bot(bot_id, token)
        return jsonify({ 'success': True, 'id': bot_id }), 200