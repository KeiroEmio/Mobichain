import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class IphoneTransaction extends BaseModel {
    static init() {
        return super.init(
            {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                iphone_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
                tx_hash: { type: Sequelize.STRING(255), allowNull: false },
                created_at: { type: Sequelize.DATE, allowNull: false }  // 添加字段定义
            },
            {
                sequelize,
                tableName: "iphone_transactions",
                modelName: "iphone_transaction",
                timestamps: false
            }
        );
    }
}

IphoneTransaction.init();
export default IphoneTransaction;