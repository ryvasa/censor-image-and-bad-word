const { Sequelize } = require("sequelize");

const db = require("../config/database.js");
const Product = require("./product.js");

const { DataTypes } = Sequelize;

const Image = db.define(
  "image",
  {
    // product_id: DataTypes.INTEGER,
    url: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  }
);
// Product.hasMany(Image, {
//   foreignKey: "product_id", // This is the foreign key column in the "image" table that links to the "product" table's primary key.
// });

module.exports = Image;
