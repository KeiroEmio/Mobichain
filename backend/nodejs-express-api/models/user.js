
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class User extends BaseModel {
	static init() {
		return super.init(
			{

				id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
				email: { type: Sequelize.STRING, defaultValue: Sequelize.literal('DEFAULT') },
				password: { type: Sequelize.STRING, defaultValue: Sequelize.literal('DEFAULT') },
				address: { type: Sequelize.STRING, defaultValue: Sequelize.literal('DEFAULT') },
				email_verified_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('DEFAULT') },
				photo: { type: Sequelize.STRING, defaultValue: Sequelize.literal('DEFAULT') },
				token: { type: Sequelize.NUMBER, defaultValue: Sequelize.literal('DEFAULT') },
				user_role_id: { type: Sequelize.INTEGER, defaultValue: Sequelize.literal('DEFAULT') }
			},
			{
				sequelize,

				tableName: "user",
				modelName: "user",
			}
		);
	}

	static listFields() {
		return [
			'id',
			'email',
			'address',
			'email_verified_at',
			'photo',
			'token',
			'user_role_id'
		];
	}

	static viewFields() {
		return [
			'id',
			'email',
			'address',
			'email_verified_at',
			'photo',
			'token',
			'user_role_id'
		];
	}

	static accounteditFields() {
		return [
			'id',
			'address',
			'photo',
			'token',
			'user_role_id'
		];
	}

	static accountviewFields() {
		return [
			'id',
			'email',
			'address',
			'email_verified_at',
			'photo',
			'token',
			'user_role_id'
		];
	}

	static editFields() {
		return [
			'id',
			'address',
			'photo',
			'token',
			'user_role_id'
		];
	}


	static searchFields() {
		return [
			// Sequelize.literal("id LIKE :search"),
			// Sequelize.literal("email LIKE :search"),
			// Sequelize.literal("address LIKE :search"),
			"email",
			"address"
		];
	}

}
User.init();
export default User;
