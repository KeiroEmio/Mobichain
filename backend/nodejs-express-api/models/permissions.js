
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Permissions extends BaseModel {
	static init() {
		return super.init(
			{
				
				permission_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				permission: { type:Sequelize.STRING , allowNull: false ,defaultValue: Sequelize.literal('DEFAULT') },
				role_id: { type:Sequelize.INTEGER  ,defaultValue: Sequelize.literal('DEFAULT') }
			}, 
			{ 
				sequelize,
				
				tableName: "permissions",
				modelName: "permissions",
			}
		);
	}
	
	static listFields() {
		return [
			'permission_id', 
			'permission', 
			'role_id'
		];
	}

	static viewFields() {
		return [
			'permission_id', 
			'permission', 
			'role_id'
		];
	}

	static editFields() {
		return [
			'permission_id', 
			'permission', 
			'role_id'
		];
	}

	
	static searchFields(){
		return [
			Sequelize.literal("permission_id LIKE :search"), 
			Sequelize.literal("permission LIKE :search"),
		];
	}

	
	
}
Permissions.init();
export default Permissions;
