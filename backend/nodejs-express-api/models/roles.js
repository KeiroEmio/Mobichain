
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Roles extends BaseModel {
	static init() {
		return super.init(
			{
				
				role_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				role_name: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				
				tableName: "roles",
				modelName: "roles",
			}
		);
	}
	
	static listFields() {
		return [
			'role_id', 
			'role_name'
		];
	}

	static viewFields() {
		return [
			'role_id', 
			'role_name'
		];
	}

	static editFields() {
		return [
			'role_id', 
			'role_name'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("role_id LIKE :search"), 
			Sequelize.literal("role_name LIKE :search"),
		];
	}

	
	
}
Roles.init();
export default Roles;
