import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Products extends BaseModel {
    static init() {
        return super.init(
            {
                id: { 
                    type: Sequelize.INTEGER, 
                    primaryKey: true, 
                    autoIncrement: true 
                },
                name: { 
                    type: Sequelize.STRING(100), 
                    allowNull: false 
                },
                description: { 
                    type: Sequelize.TEXT 
                },
                category: { 
                    type: Sequelize.STRING(50), 
                    allowNull: false 
                },
                brand: { 
                    type: Sequelize.STRING(50), 
                    allowNull: false 
                },
                price: { 
                    type: Sequelize.BIGINT, 
                    allowNull: false 
                },
                owner_address: { 
                    type: Sequelize.STRING(42), 
                    allowNull: false 
                },
                is_sold: { 
                    type: Sequelize.TINYINT(1), 
                    defaultValue: 0 
                },
                tx_hash: { 
                    type: Sequelize.STRING(255) 
                },
                block_number: { 
                    type: Sequelize.INTEGER 
                },
                photo: { 
                    type: Sequelize.STRING(255) 
                },
                created_at: { 
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW 
                },
                updated_at: { 
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.NOW 
                },
                productCount: { 
                    type: Sequelize.INTEGER,
                    defaultValue: 0 
                },
                block_hash: { 
                    type: Sequelize.STRING(255) 
                },
                from: { 
                    type: Sequelize.STRING(255) 
                },
                to: { 
                    type: Sequelize.STRING(255) 
                },
                uid: {
                    type: Sequelize.INTEGER,
                    defaultValue: 0
                }
            },
            {
                sequelize,
                tableName: "products",
                modelName: "products",
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            }
        );
    }

    static listFields() {
        return [
            'id',
            'name',
            'description',
            'category',
            'brand',
            'price',
            'owner_address',
            'is_sold',
            'tx_hash',
            'block_number',
            'photo',
            'created_at',
            'updated_at',
            'productCount',
            'block_hash',
            'from',
            'to'
        ];
    }

    static viewFields() {
        return [
            'id',
            'name',
            'description',
            'category',
            'brand',
            'price',
            'owner_address',
            'is_sold',
            'tx_hash',
            'block_number',
            'photo',
            'created_at',
            'updated_at',
            'productCount',
            'block_hash',
            'from',
            'to'
        ];
    }

    static editFields() {
        return [
            'name',
            'description',
            'category',
            'brand',
            'price',
            'owner_address',
            'is_sold',
            'tx_hash',
            'block_number',
            'photo',
            'created_at',
            'updated_at',
            'productCount',
            'block_hash',
            'from',
            'to'
        ];
    }

    static searchFields() {
        return [
            'name',
            'category',
            'brand',
            'owner_address'
        ];
    }
    static associate(models) {
        this.hasMany(models.SoldProducts, { foreignKey: 'pid', as: 'soldRecords' });
    }
}

Products.init();
export default Products;