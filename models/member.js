'use strict';
module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    user: {
      allowNull: false,
      unique: 'uniqueMember',
      type: DataTypes.INTEGER,
      references: { model: 'Users', key: 'id' }
    },
    group: {
      allowNull: false,
      unique: 'uniqueMember',
      type: DataTypes.INTEGER,
      references: { model: 'Groups', key: 'id' }
    }
  }, {
    getterMethods: {
      mapData() {
        return { id: this.id, user: this.user, group: this.group , username: this.User.username || this.user}    
      }
    }
  });
  Member.associate = function(models) {
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
  };
  return Member;
};