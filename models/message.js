'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    user: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    group: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Groups', key: 'id' }
    },
    channel: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: { model: 'Channels', key: 'id' }
    },
    body: {
      allowNull: false,
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING
    }
  }, {
      getterMethods: {
        mapData() {
          return { id: this.id, body: this.body, username: (this.User) ? this.User.username : this.user, timestamp: this.createdAt }
        }
      }
    });
  Message.associate = function (models) {
    // associations can be defined here
    this.belongsTo(models.User, {
      foreignKey: 'user',
      constraints: true,
      onDelete: "CASCADE"
    });
    this.belongsTo(models.Group, {
      foreignKey: 'group',
      constraints: true,
      onDelete: "CASCADE"
    });
    this.belongsTo(models.Channel, {
      foreignKey: 'channel',
      constraints: true,
      onDelete: "CASCADE"
    });
  };
  return Message;
};