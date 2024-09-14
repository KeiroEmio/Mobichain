
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Transaction extends BaseModel {
	static init() {
		return super.init(
			{
				
				tid: { type: Sequelize.INTEGER, primaryKey: true, defaultValue: Sequelize.literal('DEFAULT') },
				timestamp: { type:Sequelize.DATE  ,defaultValue: Sequelize.literal('DEFAULT') },
				transactioncontent: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				
				tableName: "transaction",
				modelName: "transaction",
			}
		);
	}
	
	static listFields() {
		return [
			'tid', 
			Sequelize.literal('TimeStamp AS timestamp'), 
			Sequelize.literal('transactionContent AS transactioncontent')
		];
	}

	static viewFields() {
		return [
			'tid', 
			Sequelize.literal('TimeStamp AS timestamp'), 
			Sequelize.literal('transactionContent AS transactioncontent')
		];
	}

	static editFields() {
		return [
			'tid', 
			Sequelize.literal('TimeStamp AS timestamp'), 
			Sequelize.literal('transactionContent AS transactioncontent')
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("tid LIKE :search"), 
			Sequelize.literal("transactionContent LIKE :search"),
		];
	}

	
	
}
Transaction.init();
export default Transaction;
