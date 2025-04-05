import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class ChatContacts extends BaseModel {
    static init() {
        return super.init(
            {
                id: { 
                    type: Sequelize.INTEGER, 
                    primaryKey: true, 
                    autoIncrement: true 
                },
                uid: { 
                    type: Sequelize.INTEGER, 
                    allowNull: false,
                    comment: '当前用户ID'
                },
                chatUid: { 
                    type: Sequelize.INTEGER, 
                    allowNull: false,
                    comment: '联系人用户ID'
                },
                created_at: { 
                    type: Sequelize.DATE, 
                    defaultValue: Sequelize.NOW,
                    comment: '创建时间'
                },
                updated_at: { 
                    type: Sequelize.DATE, 
                    defaultValue: Sequelize.NOW,
                    comment: '更新时间'
                }
            },
            {
                sequelize,
                tableName: "chat_contacts",
                modelName: "chat_contacts",
                timestamps: false, // 我们手动管理时间戳
                indexes: [
                    {
                        unique: true,
                        fields: ['uid', 'chatUid'],
                        name: 'unique_contact'
                    },
                    {
                        fields: ['uid'],
                        name: 'idx_uid'
                    },
                    {
                        fields: ['chatUid'],
                        name: 'idx_chatUid'
                    }
                ]
            }
        );
    }

    static listFields() {
        return [
            'id',
            'uid',
            'chatUid',
            'created_at',
            'updated_at'
        ];
    }

    static viewFields() {
        return [
            'id',
            'uid',
            'chatUid',
            'created_at',
            'updated_at'
        ];
    }

    static editFields() {
        return [
            'uid',
            'chatUid',
            'updated_at'
        ];
    }

    static searchFields() {
        return [
            Sequelize.literal("uid LIKE :search"),
            Sequelize.literal("chatUid LIKE :search")
        ];
    }

    // 关联关系
    static associate(models) {
        // 与用户表的关联
        this.belongsTo(models.User, { foreignKey: 'uid', as: 'user' });
        this.belongsTo(models.User, { foreignKey: 'chatUid', as: 'contact' });
    }
}

ChatContacts.init();
export default ChatContacts;