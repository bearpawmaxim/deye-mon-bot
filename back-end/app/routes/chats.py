from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app.services import Services


def register(app, services: Services):

    def _get_bot_name(bot_id: str):
        try:
            return services.telegram.get_bot_info(bot_id).username
        except:
            print(f'Cannot get bot info for bot {bot_id}')
            return 'Invalid bot identifier'

    def _get_chat_name(char_id: str, bot_id: str):
        try:
            chat_info = services.telegram.get_chat_info(char_id, bot_id)
            return chat_info.username if chat_info.username is not None else chat_info.title
        except:
            print(f'Cannot get chat info for chat {char_id}')
            return 'Invalid chat identifier'

    @app.route('/api/chats/allowedChats', methods=['POST'])
    @jwt_required()
    def get_chats():
        chats = services.database.get_allowed_chats()

        def process_chat(chat):
            chat_name = _get_chat_name(chat.chat_id, chat.bot_id)
            bot_name = _get_bot_name(chat.bot_id)
            return {
                'id': chat.id,
                'chatId': chat.chat_id,
                'chatName': chat_name,
                'botId': chat.bot_id,
                'botName': bot_name,
                'approveDate': chat.approve_date,
            }

        futures = [services.executor.submit(process_chat, message) for message in chats]
        chats_dict = [future.result() for future in futures]

        return jsonify(chats_dict)

    @app.route('/api/chats/chatRequests', methods=['POST'])
    @jwt_required()
    def get_chat_requests():
        chats = services.database.get_chat_requests()

        def process_chat(chat):
            chat_name = _get_chat_name(chat.chat_id, chat.bot_id)
            bot_name = _get_bot_name(chat.bot_id)
            return {
                'id': chat.id,
                'chatId': chat.chat_id,
                'chatName': chat_name,
                'botId': chat.bot_id,
                'botName': bot_name,
                'requestDate': chat.request_date,
            }

        futures = [services.executor.submit(process_chat, message) for message in chats]
        chat_requests_dict = [future.result() for future in futures]

        return jsonify(chat_requests_dict)
    
    @app.route('/api/chats/approve', methods=['PATCH'])
    @jwt_required()
    def approve_chat_request():
        request_id = request.json.get('id')

        services.database.approve_chat_request(request_id)
        services.db.session.commit()

        return { "ok": True }
    
    @app.route('/api/chats/reject', methods=['PATCH'])
    @jwt_required()
    def reject_chat_request():
        request_id = request.json.get('id')

        services.database.reject_chat_request(request_id)
        services.db.session.commit()

        return { "ok": True }