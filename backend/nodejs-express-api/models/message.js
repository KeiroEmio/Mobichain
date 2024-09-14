import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class Message extends BaseModel {
    static init() {
        return super.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    comment: 'The unique identifier for a message'
                },
                fromId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'The sender\'s user ID'
                },
                toId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: 'The recipient\'s user ID'
                },
                msg: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    comment: 'The content of the message'
                }
            },
            {
                sequelize,
                modelName: 'Message',
                tableName: 'messages',
                timestamps: false,  // Assuming no createdAt or updatedAt is required
                charset: 'utf8mb4',  // To support emoji characters
                collate: 'utf8mb4_unicode_ci'
            }
        );
    }

    static listFields() {
        return ['id', 'fromId', 'toId', 'msg'];
    }

    static viewFields() {
        return ['id', 'fromId', 'toId', 'msg'];
    }

    static editFields() {
        return ['fromId', 'toId', 'msg'];
    }

    static searchFields() {
        return [
            Sequelize.literal("fromId LIKE :search"),
            Sequelize.literal("toId LIKE :search"),
            Sequelize.literal("msg LIKE :search")
        ];
    }
}

Message.init();
export default Message;
