const { Sequelize } = require("sequelize");
const db = require("../config/database.js");
const { DataTypes } = Sequelize;

const Product = db.define(
  "product",
  {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  }
);
module.exports = Product;
