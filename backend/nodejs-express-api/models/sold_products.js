import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class SoldProducts extends BaseModel {
    static init() {
        return super.init(
            {
                id: { 
                    type: Sequelize.INTEGER, 
                    primaryKey: true, 
                    autoIncrement: true 
                },
                pid: { 
                    type: Sequelize.INTEGER, 
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'id'
                    }
                },
                uid: {  
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    comment: '用户id'
                },
                buyer_address: { 
                    type: Sequelize.STRING(255), // 修改为255长度，与图片一致
                    allowNull: false 
                },
                seller_address: { 
                    type: Sequelize.STRING(255),
                    allowNull: false 
                },
                receipt_tx:{
                    type: Sequelize.STRING(255), 
                    allowNull: true, 
                },
                price: { 
                    type: Sequelize.BIGINT, 
                    allowNull: false 
                },
                tx_hash: { 
                    type: Sequelize.STRING(255),
                    allowNull: false
                },
                block_number: { 
                    type: Sequelize.STRING(20),
                    allowNull: false
                },
                block_hash: { 
                    type: Sequelize.STRING(255),
                    allowNull: false
                },
                is_received: {
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                },
                transaction_time: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW
                },
                receipt_time: {
                    type: Sequelize.DATE,
                    allowNull: true,
                    comment: '确认收货时间'
                },
                payment_status: {
                    type: Sequelize.TINYINT(1),
                    defaultValue: 1
                }
            },
            {
                sequelize,
                tableName: "sold_products",
                modelName: "sold_products",
                timestamps: true,
                createdAt: 'transaction_time',
                updatedAt: false
            }
        );
    }

    static associate(models) {
        this.belongsTo(models.Products, { foreignKey: 'pid', as: 'product' });
        // 可以添加与User模型的关联
        // this.belongsTo(models.User, { foreignKey: 'uid', as: 'user' });
    }

    static listFields() {
        return [
            'id',
            'pid',
            'uid',  
            'buyer_address',
            'seller_address',
            'price',
            'tx_hash',
            'block_number',
            'block_hash',
            'transaction_time',
            'payment_status',
            'receipt_tx'
        ];
    }

    static viewFields() {
        return [
            'id',
            'pid',
            'uid',  
            'buyer_address',
            'seller_address',
            'price',
            'tx_hash',
            'block_number',
            'block_hash',
            'transaction_time',
            'payment_status',
            'receipt_tx'
        ];
    }

    static editFields() {
        return [
            'pid',
            'uid',  
            'buyer_address',
            'seller_address',
            'price',
            'tx_hash',
            'block_number',
            'block_hash',
            'transaction_time',
            'payment_status',
            'receipt_tx'
        ];
    }

    static searchFields() {
        return [
            'uid', 
            'buyer_address',
            'seller_address',
            'tx_hash',
            'receipt_tx'
        ];
    }
}

SoldProducts.init();
export default SoldProducts;