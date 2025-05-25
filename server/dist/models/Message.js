"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
class Message extends sequelize_1.Model {
}
Message.init({
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
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
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
    modelName: 'Message',
    tableName: 'messages',
    timestamps: false
});
User_1.default.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(User_1.default, { foreignKey: 'senderId', as: 'sender' });
exports.default = Message;
//# sourceMappingURL=Message.js.map