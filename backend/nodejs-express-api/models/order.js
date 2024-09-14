import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Order extends BaseModel {
    static init() {
        return super.init(
            {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                androidId: { type: Sequelize.INTEGER, allowNull: false },
                buyerId: { type: Sequelize.INTEGER, allowNull: false },
                sellerId: { type: Sequelize.INTEGER, allowNull: false },
                price: { type: Sequelize.NUMBER, allowNull: false, defaultValue: Sequelize.literal('DEFAULT') },
                status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' }, // Status can be 'pending', 'completed', 'cancelled'
                transactionTime: { type: Sequelize.DATE, defaultValue: Sequelize.literal('DEFAULT') }
            },
            {
                sequelize,
                tableName: "order",
                modelName: "order",
            }
        );
    }

    static listFields() {
        return [
            'id',
            'androidId',
            'buyerId',
            'sellerId',
            'price',
            'status',
            Sequelize.literal('transactionTime AS transactiontime')
        ];
    }

    static viewFields() {
        return [
            'id',
            'androidId',
            'buyerId',
            'sellerId',
            'price',
            'status',
            Sequelize.literal('transactionTime AS transactiontime')
        ];
    }

    static editFields() {
        return [
            'id',
            'androidId',
            'buyerId',
            'sellerId',
            'price',
            'status',
            Sequelize.literal('transactionTime AS transactiontime')
        ];
    }

    static searchFields() {
        return [
            Sequelize.literal("androidId LIKE :search"),
            Sequelize.literal("buyerId LIKE :search"),
            Sequelize.literal("sellerId LIKE :search"),
            Sequelize.literal("status LIKE :search"),
        ];
    }
}

Order.init();
export default Order;
