var q = require("q");
// var db=require("../common/database");
// var conn=db.getConnection();
var mysql = require("../common/database").pool;
const PushNotifications = require("@pusher/push-notifications-server");
let beamsClient = new PushNotifications({
  instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
  secretKey: "D602CFC742F3C10B747DB1D4F65E310851A5627F6A573F17239B1395AB2D6562",
});

function getAllPosts() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM posts", function (err, result) {
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

function addPost(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO posts SET ?",
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

function getPostByID(id) {
  try {
    var defer = q.defer();
    if (id) {
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM posts WHERE ?",
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

function updatePost(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE posts SET title=?, content=?, author=?, updated_at=? WHERE id=?",
          [
            params.title,
            params.content,
            params.author,
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

function deletePost(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM posts WHERE id=?",
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

// function getTodosPost(res){

// };

//Post track id and navigation
function getAllPostsIp() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM postsip", function (err, result) {
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

function getAllPostsIpbyUser(id_user) {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT * FROM postsip WHERE ?",
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
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getPostIpbyTitle(title) {
  try {
    var defer = q.defer();
    if (title) {
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM postsip WHERE ?",
          { title: title },
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

function addPostIp(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO postsip SET ?",
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

// function getPostIpByID(id){
//     var defer= q.defer();

//     mysql.getConnection((err, connection) => {
//            if(err) return defer.reject(err);
//            connection.query("SELECT * FROM postsip WHERE ?", {id:id}, function(err,postsip){
//         if(err){
//             defer.reject(err);
//         } else {
//             defer.resolve(postsip);
//         }
//     });
//     return defer.promise;
// };

function deletePostIp(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM postsip WHERE id=?",
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

function addDataIp(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO dataip SET ?",
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
function getDataIpbyTitle(title) {
  try {
    var defer = q.defer();
    if (title) {
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM dataip WHERE ?",
          { title: title },
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
function deleteDataIp(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM dataip WHERE id=?",
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
function deleteDataIpbyTitle(title) {
  try {
    if (title) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM dataip WHERE title=?",
          [title],
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
function addDataChat(params) {
  try {
    if (params) {
      var defer = q.defer();
      var online = params.online;
      var titleUser = params.user_name;
      delete params.user_name;
      delete params.online;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO datachat SET ?",
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
      //console.log('message.online',online);
      if (online == 0) {
        if (params.msg.length <= 50) {
          var option = "Tin nhắn: " + params.msg;
        } else {
          var option = "Tin nhắn mới!";
        }
        var user;

        if (params.trackper == 2) {
          user = 51296;
          // titleUser="User";
        } else if (params.trackper == 1 && params.re_user != 51296) {
          user = params.re_user;
          titleUser = "Admin";
        }
        // var option= "Tin nhắn: "+ msgno;
        beamsClient
          .publishToInterests([user + "notifi"], {
            apns: {
              aps: {
                alert: {
                  title: titleUser,
                  body: option,
                },
              },
            },
            fcm: {
              notification: {
                title: titleUser,
                body: option,
              },
            },
            web: {
              notification: {
                title: titleUser,
                body: option,
                icon: "https://faceblogs.onrender.com/static/favicon.ico",
                deep_link: "https://faceblogs.onrender.com/giaoviec",
              },
            },
          })
          .then((publishResponse) => {
            console.log("Just published:", publishResponse.publishId);
          })
          .catch((error) => {
            console.log("Error:", error);
          });
      }
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
function getAllDataChat() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT * FROM datachat ORDER BY created_at DESC LIMIT 50",
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
function getAllDataChatbyIdUser(id_user) {
  try {
    if (id_user) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM datachat WHERE ((trackper=2 AND id_user = ? AND re_user = 51296) OR (trackper=1 AND (re_user = 0 OR re_user = ?))) ORDER BY created_at DESC LIMIT 30",
          [id_user, id_user],
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
function addDataImg(params) {
  try {
    if (params) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO dataphoto SET ?",
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

function getDataImg(id) {
  try {
    var defer = q.defer();
    if (id) {
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM dataphoto WHERE ?",
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
function getDataAllImg() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT id FROM dataphoto", function (err, result) {
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

function deleteDataImg(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM dataphoto WHERE id=?",
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
  getAllPosts: getAllPosts,
  addPost: addPost,
  getPostByID: getPostByID,
  updatePost: updatePost,
  deletePost: deletePost,
  addPostIp: addPostIp,
  getAllPostsIpbyUser: getAllPostsIpbyUser,
  getPostIpbyTitle: getPostIpbyTitle,
  getAllPostsIp: getAllPostsIp,
  deletePostIp: deletePostIp,
  addDataIp: addDataIp,
  getDataIpbyTitle: getDataIpbyTitle,
  deleteDataIp: deleteDataIp,
  deleteDataIpbyTitle: deleteDataIpbyTitle,
  addDataChat: addDataChat,
  getAllDataChat: getAllDataChat,
  getAllDataChatbyIdUser: getAllDataChatbyIdUser,
  addDataImg: addDataImg,
  getDataImg: getDataImg,
  getDataAllImg: getDataAllImg,
  deleteDataImg: deleteDataImg,
};
