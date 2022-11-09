var q = require("q");
var mysql = require("../common/database").pool;
// var conn=db.getConnection();
function addUser(user) {
  try {
    if (user) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO users SET ?",
          user,
          function (err, result) {
            connection.release(); // return the connection to pool
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve(result);
            }
          }
        );
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
function getUserbyEmail(email) {
  try {
    if (email) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM users WHERE ?",
          { email: email },
          function (err, result) {
            connection.release(); // return the connection to pool
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve(result);
            }
          }
        );
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getUserbyID(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM users WHERE ?",
          { id: id },
          function (err, result) {
            connection.release(); // return the connection to pool
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve(result);
            }
          }
        );
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getAllUsers() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM users", function (err, result) {
        connection.release(); // return the connection to pool
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(result);
        }
      });
    });
    return defer.promise;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getIdNameUsers() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT id,last_name,permission FROM users",
        function (err, result) {
          connection.release(); // return the connection to pool
          if (err) {
            defer.reject(err);
          } else {
            defer.resolve(result);
          }
        }
      );
    });
    return defer.promise;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getNameUsers() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT id,last_name,permission FROM users",
        function (err, result) {
          connection.release(); // return the connection to pool
          if (err) {
            defer.reject(err);
          } else {
            defer.resolve(result);
          }
        }
      );
    });
    return defer.promise;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function updateUser(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE users SET password=?, last_name=?, updated_at=? WHERE id=?",
          [
            params.password,
            params.last_name,
            new Date().toLocaleString("vi-VN"),
            params.id,
          ],
          function (err, result) {
            connection.release(); // return the connection to pool
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve(result);
            }
          }
        );
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
function updateTokenbyEmail(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE users SET restoken=? WHERE email=?",
          [params.refreshToken, params.email],
          function (err, result) {
            connection.release(); // return the connection to pool
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve(result);
            }
          }
        );
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
// function getUserbyToken(restokendt){
//     if (restokendt){
//     var defer= q.defer();
//     mysql.getConnection((err, connection) => {
//           if(err) return defer.reject(err);
//          connection.query("SELECT * FROM users WHERE ?",{restoken:restokendt}, function(err,result){
//         if(err){
//             defer.reject(err);
//         } else {
//             defer.resolve(result);
//         }
//     });
//     return defer.promise;
//     };
//     return false;
// };
function deleteUser(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM users WHERE id=?",
          [id],
          function (err, result) {
            connection.release(); // return the connection to pool
            if (err) {
              defer.reject(err);
            } else {
              defer.resolve(result);
            }
          }
        );
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  addUser: addUser,
  getUserbyEmail: getUserbyEmail,
  getAllUsers: getAllUsers,
  getUserbyID: getUserbyID,
  updateUser: updateUser,
  deleteUser: deleteUser,
  getIdNameUsers: getIdNameUsers,
  getNameUsers: getNameUsers,
  updateTokenbyEmail: updateTokenbyEmail,
};
