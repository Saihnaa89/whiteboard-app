import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Message from './Message';
import User from './User';
class Attachment extends Model {
}
Attachment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    messageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'messages',
            key: 'id'
        }
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    uploaderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    uploadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    tableName: 'attachments',
    modelName: 'Attachment',
    timestamps: false
});
Message.hasMany(Attachment, { foreignKey: 'messageId', as: 'attachments' });
Attachment.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
User.hasMany(Attachment, { foreignKey: 'uploaderId', as: 'uploadedAttachments' });
Attachment.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });
export default Attachment;
