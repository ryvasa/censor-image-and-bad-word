const { Sequelize } = require("sequelize");

const db = new Sequelize("testimg", "root", "123", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = db;
