import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
class Message extends Model {
}
Message.init({
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
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
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
    modelName: 'Message',
    tableName: 'messages',
    timestamps: false
});
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
export default Message;
