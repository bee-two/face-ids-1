var q = require("q");
// var db=require("../common/database");
// var conn=db.getConnection();
// const PushNotifications = require("@pusher/push-notifications-server");
// let beamsClient = new PushNotifications({
//     instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
//     secretKey: "D602CFC742F3C10B747DB1D4F65E310851A5627F6A573F17239B1395AB2D6562",
//   });
var mysql = require("../common/database").pool;
function getAllTodosbyUser(id_user) {
  try {
    if (id_user) {
      var defer = q.defer();
      //, isDone=0 ORDER BY end_at
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM nodetodos WHERE ? AND ((end_at < CURDATE() AND isDone=0) OR (end_at = CURDATE() AND isDone=0 ) OR (end_at > CURDATE() AND DATEDIFF(CURDATE(),end_at)<10)) ORDER BY end_at DESC LIMIT 15",
          { id_user: id_user },
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

function getAllTodos() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT * FROM nodetodos WHERE (end_at < CURDATE() AND isDone=0) OR end_at = CURDATE() OR (end_at > CURDATE() AND DATEDIFF(CURDATE(),end_at) < 15 AND isDone=0) OR (end_at > CURDATE() AND DATEDIFF(CURDATE(),end_at) < 7 AND isDone=1) ORDER BY end_at DESC LIMIT 30",
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

function getAllTodobyDay(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM nodetodos WHERE ? < end_at AND ? > end_at",
          [params.start, params.end],
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

function getTodobyID(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM nodetodos WHERE ?",
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

function addTodo(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO nodetodos SET ?",
          params,
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

function updateTodo(params) {
  //Người dùng yêu cầu cập nhật
  try {
    if (params) {
      var defer = q.defer();
      if (params.job_num == 2) {
        mysql.getConnection((err, connection) => {
          if (err) return defer.reject(err);
          connection.query(
            "UPDATE nodetodos SET text_jobdemo=?, job_num=?,  end_atdemo=? WHERE id=?",
            [params.text_jobdemo, 2, params.end_atdemo, params.id],
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
      } else if (params.job_num == 1) {
        mysql.getConnection((err, connection) => {
          if (err) return defer.reject(err);
          connection.query(
            "UPDATE nodetodos SET text_job=?, text_jobdemo=?, job_num=?,  end_at=?, end_atdemo=? WHERE id=?",
            [
              params.text_jobdemo,
              params.text_jobdemo,
              1,
              params.end_atdemo,
              params.end_atdemo,
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
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function sucessUpdateTodo(params) {
  //Admin đồng ý yêu cầu cập nhật người dùng
  try {
    if (params) {
      var defer = q.defer();
      if (params.end_atreal !== null) {
        mysql.getConnection((err, connection) => {
          if (err) return defer.reject(err);
          connection.query(
            "UPDATE nodetodos SET job_num=?,  end_atreal=?, isDone=?, isDonedemo=?  WHERE id=?",
            [1, params.end_atreal, 1, 1, params.id],
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
      } else if (params.job_num == 2) {
        mysql.getConnection((err, connection) => {
          if (err) return defer.reject(err);
          connection.query(
            "UPDATE nodetodos SET job_num=?, isDonedemo=? WHERE id=?",
            [2, params.isDone, params.id],
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
      } else if (params.job_num == 1 && params.end_atreal == null) {
        mysql.getConnection((err, connection) => {
          if (err) return defer.reject(err);
          connection.query(
            "UPDATE nodetodos SET job_num=?,  end_atreal=?, isDone=?, isDonedemo=? WHERE id=?",
            [1, null, 0, 0, params.id],
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
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function notSuccUpdateTodo(params) {
  //Admin không đồng ý yêu cầu cập nhật người dùng
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE nodetodos SET text_jobdemo=?, job_num=?,  end_atdemo=?,  isDoneDemo=?  WHERE id=?",
          [params.text_job, 1, params.end_atdemo, params.isDoneDemo, params.id],
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

function deleteTodo(id) {
  //admin xóa việc
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM nodetodos WHERE id=?",
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

// function notifiTodo(id,option){
//     //thông báo công việc
//     beamsClient.publishToInterests([id+"notifi"], {
//         apns: {
//           aps: {
//             alert: {
//                 title: 'Admin Giao việc',
//                 body: option
//             }
//           }
//         },
//         fcm: {
//           notification: {
//             title: 'Admin Giao việc',
//             body: option
//           }
//         },
//         web: {
//             notification: {
//                 title: 'Admin Giao việc',
//                 body: option,
//                 icon:'https://faceblogs.onrender.com/static/favicon.ico',
//                 deep_link: 'https://faceblogs.onrender.com/giaoviec'
//             }
//         }
//       }).then((publishResponse) => {
//         console.log('Just published:', publishResponse.publishId);
//       }).catch((error) => {
//         console.log('Error:', error);
//       });
// };

function getCountInfoTodoLatebyID() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT id_user FROM nodetodos WHERE DATE(end_at) < DATE(CURDATE()) AND isDone=0",
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

function getCountInfoTodoDaybyID() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT id_user FROM nodetodos WHERE (DATE(end_at) < DATE(CURDATE()) OR DATE(end_at) = DATE(CURDATE())) AND isDone=0",
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

module.exports = {
  getAllTodosbyUser: getAllTodosbyUser,
  getAllTodos: getAllTodos,
  getAllTodobyDay: getAllTodobyDay,
  getTodobyID: getTodobyID,
  addTodo: addTodo,
  updateTodo: updateTodo,
  sucessUpdateTodo: sucessUpdateTodo,
  notSuccUpdateTodo: notSuccUpdateTodo,
  deleteTodo: deleteTodo,
  // notifiTodo: notifiTodo,
  getCountInfoTodoLatebyID: getCountInfoTodoLatebyID,
  getCountInfoTodoDaybyID: getCountInfoTodoDaybyID,
};
