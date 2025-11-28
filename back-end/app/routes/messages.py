from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services
from app.models import Message
from app.utils.jwt_decorators import jwt_required


def register(app, services: Services):
    def _get_bot_name(bot_id: str):
        try:
            return services.telegram.get_bot_info(bot_id).username
        except:
            print(f'Cannot get bot info for bot {bot_id}')
            return 'Invalid bot identifier'

    def _get_channel_name(channel_id: str, bot_id: str):
        try:
            chat_info = services.telegram.get_chat_info(channel_id, bot_id)
            return chat_info.title
        except:
            print(f'Cannot get channel info for channel {channel_id}')
            return 'Invalid channel identifier'

    @app.route('/api/messages/messages', methods=['GET'])
    @jwt_required()
    def get_messages():
        messages = services.database.get_messages(all=True)

        def process_message(message):
            bot_name = _get_bot_name(message.bot_id)
            channel_name = _get_channel_name(message.channel_id, message.bot_id)
            stations = [station.id for station in message.stations]
            return {
                'id': message.id,
                'name': message.name,
                'channelName': channel_name,
                'stations': stations,
                'botName': bot_name,
                'lastSentTime': message.last_sent_time,
                'enabled': message.enabled,
            }

        messages_dict = [process_message(message) for message in messages]

        return jsonify(messages_dict)

    @app.route('/api/messages/getChannel', methods=['POST'])
    @jwt_required()
    def get_channel():
        channel_id = request.json.get('channelId', None)
        bot_id = request.json.get('botId', None)
        if bot_id is None or channel_id is None:
            return jsonify({ 'success': False, 'error': 'channelId and botId should be specified' }), 405
        channel_name = _get_channel_name(channel_id, bot_id)
        return jsonify({ 'success': True, 'channelName': channel_name })

    @app.route('/api/messages/message/<message_id>', methods=['GET'])
    @jwt_required()
    def get_message(message_id: int):
        message = services.database.get_message(message_id)
        bot_name = _get_bot_name(message.bot_id)
        channel_name = _get_channel_name(message.channel_id, message.bot_id)
        stations = [station.id for station in message.stations]
        return jsonify({
            'id': message.id,
            'name': message.name,
            'channelId': message.channel_id,
            'channelName': channel_name,
            'messageTemplate': message.message_template,
            'shouldSendTemplate': message.should_send_template,
            'timeoutTemplate': message.timeout_template,
            'stations': stations,
            'botId': message.bot_id,
            'botName': bot_name,
            'lastSentTime': message.last_sent_time,
            'enabled': message.enabled,
        })

    @app.route('/api/messages/getPreview', methods=['POST'])
    @jwt_required()
    def get_message_preview():
        server_stations = services.database.get_stations(True)
        json = request.json
        station_ids = json.get("stations", None)
        id_set = set(station_ids)
        stations = [s for s in server_stations if s.id in id_set]
        message = Message(
            name = json.get("name"),
            channel_id = json.get("channelId"),
            message_template = json.get("messageTemplate"),
            timeout_template = json.get("timeoutTemplate"),
            should_send_template = json.get("shouldSendTemplate", None),
            stations = stations,
            bot_id = json.get("botId")
        )
        try:
            info = services.bot.get_message(message)
            if info is None:
                return jsonify({
                    'success': False,
                    'error': str(e)
                })
            return jsonify({
                'success': True,
                'message': info.message,
                'shouldSend': info.should_send,
                'timeout': info.timeout,
                'nextSendTime': info.next_send_time,
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            })

    @app.route('/api/messages/saveState', methods=['PATCH'])
    @jwt_required()
    def save_message_state():
        id = request.json.get("id", None)
        enabled = request.json.get("enabled", False)
        services.database.save_message_state(id, enabled)
        services.db.session.commit()
        services.events.broadcast_private("messages_updated")

        return jsonify({ 'success': True, 'id': id }), 200

    @app.route('/api/messages/save', methods=['PATCH'])
    @jwt_required()
    def save_message():
        server_stations = services.database.get_stations(True)
        station_ids = request.json.get("stations", None)
        id_set = set(station_ids)
        stations = [s for s in server_stations if s.id in id_set]

        message = Message(
            id = request.json.get("id", None),
            name = request.json.get("name"),
            channel_id = request.json.get("channelId"),
            message_template = request.json.get("messageTemplate"),
            timeout_template = request.json.get("timeoutTemplate"),
            should_send_template = request.json.get("shouldSendTemplate", None),
            stations = stations,
            bot_id = request.json.get("botId"),
            enabled = request.json.get("enabled")
        )
        id = services.database.save_message(message)
        services.db.session.commit()
        services.events.broadcast_private("messages_updated")
        return jsonify({ 'success': True, 'id': id }), 200
