import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
class ChatMessage extends Model {
}
ChatMessage.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    senderName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roomId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'chat_messages',
    timestamps: true
});
export default ChatMessage;
