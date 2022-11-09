var bcrypt = require("bcrypt");
//var config = require("config");
const dotenv = require('dotenv').config();
function hash_password(password) {
  var saltRounds = 10;
  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(password, salt);
  return hash;
}
function compare_password(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = {
  hash_password: hash_password,
  compare_password: compare_password,
};
