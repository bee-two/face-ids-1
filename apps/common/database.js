//var config = require("config");
//const dotenv = require('dotenv').config();
var mysql = require("mysql");
// const pool = mysql.createPool({
//   host: "sql.freedb.tech",
//   user: "freedb_Bee961",
//     password: "?yc2ej6jYcyut*K",
//   database: "freedb_kdzuy1996",
//   port: 3306,
// });
const pool = mysql.createPool({
  host: "remotemysql.com",
  user: "jRJmC5zoo2",
  password: "958teQuFyS",
  database: "jRJmC5zoo2",
  port: 3306,
});
exports.pool = pool;
