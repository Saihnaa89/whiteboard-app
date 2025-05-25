"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class ChatMessage extends sequelize_1.Model {
}
ChatMessage.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    senderId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    senderName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    roomId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.default,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: true
});
exports.default = ChatMessage;
//# sourceMappingURL=ChatMessage.js.map