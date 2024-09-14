import { BaseModel, sequelize, Sequelize } from "./basemodel.js";

class ImagePaths extends BaseModel {
    static init() {
        return super.init(
            {
                id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
                associated_record_id: { type: Sequelize.BIGINT, allowNull: false },
                image_path: { type: Sequelize.STRING, allowNull: false }
            },
            {
                sequelize,
                tableName: "imagepaths",
                modelName: "ImagePaths",
            }
        );
    }

    static viewFields() {
        return [
            'id',
            'associated_record_id',
            'image_path'
        ];
    }
}

ImagePaths.init();
export default ImagePaths;
