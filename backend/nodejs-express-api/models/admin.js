
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Admin extends BaseModel {
	static init() {
		return super.init(
			{
				
				id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				email: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') },
				password: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') },
				address: { type:Sequelize.STRING  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				
				tableName: "admin",
				modelName: "admin",
			}
		);
	}
	
	static listFields() {
		return [
			'id', 
			'email', 
			'address'
		];
	}

	static viewFields() {
		return [
			'id', 
			'email', 
			'address'
		];
	}

	static editFields() {
		return [
			'email', 
			'address', 
			'id'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("id LIKE :search"), 
			Sequelize.literal("email LIKE :search"), 
			Sequelize.literal("address LIKE :search"), 
			Sequelize.literal("password LIKE :search"),
		];
	}

	
	
}
Admin.init();
export default Admin;
