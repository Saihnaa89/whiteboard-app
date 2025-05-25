"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Message_1 = __importDefault(require("./Message"));
const User_1 = __importDefault(require("./User"));
class Attachment extends sequelize_1.Model {
}
Attachment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    messageId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'messages',
            key: 'id'
        }
    },
    fileName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    mimeType: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false
    },
    fileSize: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    uploaderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    uploadedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.default,
    tableName: 'attachments',
    modelName: 'Attachment',
    timestamps: false
});
Message_1.default.hasMany(Attachment, { foreignKey: 'messageId', as: 'attachments' });
Attachment.belongsTo(Message_1.default, { foreignKey: 'messageId', as: 'message' });
User_1.default.hasMany(Attachment, { foreignKey: 'uploaderId', as: 'uploadedAttachments' });
Attachment.belongsTo(User_1.default, { foreignKey: 'uploaderId', as: 'uploader' });
exports.default = Attachment;
//# sourceMappingURL=Attachment.js.map