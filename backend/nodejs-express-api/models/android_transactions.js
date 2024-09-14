import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class AndroidTransaction extends BaseModel {
    static init() {
        return super.init(
            {
                id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
                android_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
                tx_hash: { type: Sequelize.STRING(255), allowNull: false },
                created_at: { type: Sequelize.DATE, allowNull: false }  // 添加字段定义
            },
            {
                sequelize,
                tableName: "android_transactions",
                modelName: "android_transaction",
                timestamps: false
            }
        );
    }
}

AndroidTransaction.init();
export default AndroidTransaction;