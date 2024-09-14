
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class ChatMessages extends BaseModel {
	static init() {
		return super.init(
			{
				
				msg_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				sender_address: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') },
				receiver_address: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') },
				timestamp: { type:Sequelize.DATE , allowNull: false  },
				message_text: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				
				tableName: "chat_messages",
				modelName: "chat_messages",
			}
		);
	}
	
	static listFields() {
		return [
			'msg_id', 
			'sender_address', 
			'receiver_address', 
			'timestamp', 
			'message_text'
		];
	}

	static viewFields() {
		return [
			'msg_id', 
			'sender_address', 
			'receiver_address', 
			'timestamp', 
			'message_text'
		];
	}

	static editFields() {
		return [
			'msg_id', 
			'sender_address', 
			'receiver_address', 
			'message_text'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("msg_id LIKE :search"), 
			Sequelize.literal("sender_address LIKE :search"), 
			Sequelize.literal("receiver_address LIKE :search"), 
			Sequelize.literal("message_text LIKE :search"),
		];
	}

	
	
}
ChatMessages.init();
export default ChatMessages;
