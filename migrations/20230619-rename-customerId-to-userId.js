'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('orders', 'customerId', 'userId');
    await queryInterface.changeColumn('orders', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('orders', 'userId', 'customerId');
    await queryInterface.changeColumn('orders', 'customerId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
    });
  }
};
