
import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Android extends BaseModel {
	static init() {
		return super.init(
			{

				id: { type: Sequelize.STRING, primaryKey: true, autoIncrement: true },
				brand: { type: Sequelize.STRING, allowNull: false, defaultValue: Sequelize.literal('DEFAULT') },
				model: { type: Sequelize.STRING, allowNull: false, defaultValue: Sequelize.literal('DEFAULT') },
				price: { type: Sequelize.NUMBER, allowNull: false, defaultValue: Sequelize.literal('DEFAULT') },
				owner: { type: Sequelize.STRING, allowNull: false, defaultValue: Sequelize.literal('DEFAULT') },
				transactiontime: { type: Sequelize.DATE },
				issold: { type: Sequelize.INTEGER, allowNull: false },
				imagepath: { type: Sequelize.STRING, defaultValue: Sequelize.literal('DEFAULT') },
				confirmedReceipt: { type: Sequelize.INTEGER, allowNull: false, defaultValue: Sequelize.literal('DEFAULT') }

			},
			{
				sequelize,

				tableName: "android",
				modelName: "android", timestamps: true,
				updatedAt: 'transactiontime',

			}
		);
	}

	static listFields() {
		return [
			'brand',
			'model',
			'price',
			'owner',
			// Sequelize.literal('transactionTime AS transactiontime'),
			'imagePath',
			'createdAt',
			'issold',
			// Sequelize.literal('imagePath AS imagepath'),
			'id',
			'confirmedReceipt'
		];
	}

	static viewFields() {
		return [
			'id',
			'brand',
			'model',
			'price',
			'owner',
			Sequelize.literal('transactionTime AS transactiontime'),
			'issold',
			Sequelize.literal('imagePath AS imagepath'),
			'confirmedReceipt'
		];
	}

	static editFields() {
		return [
			'brand',
			'model',
			'price',
			'owner',
			'issold',
			Sequelize.literal('imagePath AS imagepath'),
			'id',
			'confirmedReceipt'
		];
	}


	static searchFields() {
		return ['brand', 'model', 'owner'];
	}



}
Android.init();
export default Android;
