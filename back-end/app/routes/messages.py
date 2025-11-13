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

    @app.route('/api/messages/messages', methods=['POST'])
    @jwt_required()
    def get_messages():
        messages = services.database.get_messages(all=True)

        def process_message(message):
            bot_name = _get_bot_name(message.bot_id)
            channel_name = _get_channel_name(message.channel_id, message.bot_id)
            station_name = message.station.station_name if message.station else ''
            return {
                'id': message.id,
                'name': message.name,
                'channelName': channel_name,
                'stationName': station_name,
                'botName': bot_name,
                'lastSentTime': message.last_sent_time,
                'enabled': message.enabled,
            }

        futures = [services.executor.submit(process_message, message) for message in messages]
        messages_dict = [future.result() for future in futures]

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

    @app.route('/api/messages/message/<message_id>', methods=['POST'])
    @jwt_required()
    def get_message(message_id: int):
        message = services.database.get_message(message_id)
        bot_name = _get_bot_name(message.bot_id)
        channel_name = _get_channel_name(message.channel_id, message.bot_id)
        station_name = message.station.station_name if message.station else ''
        return jsonify({
            'id': message.id,
            'name': message.name,
            'channelId': message.channel_id,
            'channelName': channel_name,
            'messageTemplate': message.message_template,
            'shouldSendTemplate': message.should_send_template,
            'timeoutTemplate': message.timeout_template,
            'stationId': message.station_id,
            'stationName': station_name,
            'botId': message.bot_id,
            'botName': bot_name,
            'lastSentTime': message.last_sent_time,
            'enabled': message.enabled,
        })

    @app.route('/api/messages/getPreview', methods=['POST'])
    @jwt_required()
    def get_message_preview():
        station_id = request.json.get("stationId", None)
        message = Message(
            channel_id = request.json.get("channelId"),
            message_template = request.json.get("messageTemplate"),
            timeout_template = request.json.get("timeoutTemplate"),
            should_send_template = request.json.get("shouldSendTemplate", None),
            station_id = station_id if station_id is not None and station_id != 0 else None,
            bot_id = request.json.get("botId")
        )
        try:
            info = services.bot.get_message(message)
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

    @app.route('/api/messages/save', methods=['PATCH'])
    @jwt_required()
    def save_message():
        station_id = request.json.get("stationId", None)
        message = Message(
            id = request.json.get("id", None),
            name = request.json.get("name"),
            channel_id = request.json.get("channelId"),
            message_template = request.json.get("messageTemplate"),
            timeout_template = request.json.get("timeoutTemplate"),
            should_send_template = request.json.get("shouldSendTemplate", None),
            station_id = station_id if station_id is not None and station_id != 0 else None,
            bot_id = request.json.get("botId"),
            enabled = request.json.get("enabled")
        )
        id = services.database.save_message(message)
        services.db.session.commit()
        return jsonify({ 'success': True, 'id': id }), 200
