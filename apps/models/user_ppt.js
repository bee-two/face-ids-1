var q = require("q");
var mysql = require("../common/database").pool;
// var conn=db.getConnection();
function addAcoutFb(user) {
  try {
    if (user) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO accountfblogin SET ?",
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
function addFbStt(link) {
  try {
    if (link) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO liststt SET ?",
          link,
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
function addJob(link) {
  try {
    if (link) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query("INSERT INTO job SET ?", link, function (err, result) {
          connection.release(); // return the connection to pool
          if (err) {
            defer.reject(err);
          } else {
            defer.resolve(result);
          }
        });
      });
      return defer.promise;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
function addTimeAuto(data) {
  try {
    if (data) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO timeloadautofb SET ?",
          data,
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
function addKeyFb(key) {
  try {
    if (key) {
      var defer = q.defer();
      var value = {
        keyword: removeVietnameseTones(key),
        main: key,
        appeared: 0,
      };
      console.log("Value of removeVietnameseTones: " + value);
      if (
        value === false ||
        value.keyword === false ||
        value.keyword === undefined
      )
        return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO keyfind SET ?",
          value,
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
function addKeyWeb(key, date) {
  try {
    if (key && date) {
      var defer = q.defer();

      var value = {
        keyval: removeVietnameseTones(key),
        arr: JSON.stringify({
          main: [0],
          LV1: 0,
          LV2: 0,
        }),
        created_at: date,
        numcheck: 0,
        run: false,
      };
      console.log("Value of removeVietnameseTones: " + value);
      if (
        value === false ||
        value.keyval === false ||
        value.keyval === undefined
      )
        return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO listweb SET ?",
          value,
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
function addUIDContent(data) {
  try {
    if (data) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO historystt SET ?",
          data,
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
function addKeytrain(key) {
  try {
    if (key) {
      var defer = q.defer();
      var value = {
        keytrain: removeVietnameseTones(key),
      };
      console.log("Value of removeVietnameseTones: " + value);
      if (
        value === false ||
        value.keytrain === false ||
        value.keytrain === undefined
      )
        return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO keytrain SET ?",
          value,
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
function addFbProblem(user) {
  try {
    if (user) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "INSERT INTO accountfb SET ?",
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
function getAcoutFbbyEmail(email) {
  try {
    if (email) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM accountfblogin WHERE ?",
          { user_name: email },
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
function getAllFbStt() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM liststt", function (err, result) {
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
function getAllFbProb() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM accountfb", function (err, result) {
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
function getKeyFb(key) {
  try {
    if (key) {
      var defer = q.defer();
      var value = removeVietnameseTones(key);
      console.log("Get Value of removeVietnameseTones: " + value);
      if (value === false || value === undefined) return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM keyfind WHERE ?",
          { keyword: value },
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
function getTimebyTime(data) {
  try {
    if (data) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM timeloadautofb WHERE creat_hour=? AND creat_minute=?",
          [data.creat_hour, data.creat_minute],
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
function getJobByName(name) {
  try {
    if (name) {
      var defer = q.defer();
      var name = removeVietnameseTones(name);
      console.log("Get Value of removeVietnameseTones: " + name);
      if (name === false || name === undefined) return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM job WHERE ?",
          { name: name },
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
function getUIDContentByUID(uid) {
  try {
    if (uid) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM historystt WHERE ?",
          { id_fb: uid },
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
function getFBProbByUID(UID) {
  try {
    if (UID) {
      var defer = q.defer();
      if (UID === false || UID === undefined) return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM accountfb WHERE ?",
          { id_fb: UID },
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
function getAllFBProb() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM accountfb", function (err, result) {
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
function getSTTProbByUID(UID) {
  try {
    if (UID) {
      var defer = q.defer();
      if (UID === false || UID === undefined || UID === "") return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM liststt WHERE ?",
          { link_stt: UID },
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
function getAllSTTProb() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM liststt", function (err, result) {
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
function getSTTProbByFBID(UID) {
  try {
    if (UID) {
      var defer = q.defer();
      if (UID === false || UID === undefined || UID === "") return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM liststt WHERE ?",
          { id_fb: UID },
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
function getSTTProbCheckNoByFBID(UID) {
  try {
    if (UID) {
      var defer = q.defer();
      if (UID === false || UID === undefined || UID === "") return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM liststt WHERE id_fb=? AND check_info=0",
          [UID],
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
function getFBProbByTimes(lv, longdate) {
  try {
    if (lv && longdate) {
      var defer = q.defer();
      if (
        lv === "" ||
        lv === undefined ||
        longdate === false ||
        longdate === undefined
      )
        return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM accountfb WHERE problem=? AND DATEDIFF(CURDATE(),created)<=?",
          [lv, longdate],
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
function getKeytrain(key) {
  try {
    if (key) {
      var defer = q.defer();
      var value = removeVietnameseTones(key);
      console.log("Get Value of removeVietnameseTones: " + value);
      if (value === false || value === undefined) return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM keytrain WHERE ?",
          { keytrain: value },
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
function getKeyWebByKey(key) {
  try {
    if (key) {
      var defer = q.defer();
      var value = removeVietnameseTones(key);
      console.log("Get Value of removeVietnameseTones: " + value);
      if (value === false || value === undefined) return false;
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "SELECT * FROM listweb WHERE ?",
          { keyval: value },
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
function getAllKeyFb() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM keyfind", function (err, result) {
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
function getAllJob() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM job", function (err, result) {
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
function getAllTimeRunAuto() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM timeloadautofb", function (err, result) {
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
function getAllKeytrain() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM keytrain", function (err, result) {
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
function getAllKeyWeb() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM listweb", function (err, result) {
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
function getAllUIDContent() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query("SELECT * FROM historystt", function (err, result) {
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
function updateCookiebyEmail(cookies, user_name, number_login) {
  try {
    if (cookies && user_name && number_login) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE accountfblogin SET cookies=?,number_login=? WHERE user_name=?",
          [cookies, number_login, user_name],
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
function getCookies() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT cookies,number_login,user_name FROM accountfblogin WHERE number_login=(SELECT MIN(number_login) FROM accountfblogin) LIMIT 2",
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

function updateNumberLoginbyEmail(number, user_name) {
  try {
    if (number && user_name) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE accountfblogin SET number_login=? WHERE user_name=?",
          [number, user_name],
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
function updateNumberKeybyKey(number, key) {
  try {
    if (number && key) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE keyfind SET appeared=? WHERE keyword=?",
          [number, key],
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
function updateJobByName(value) {
  try {
    if (value) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE job SET listjob=?, checkrun=?,	trainning=? WHERE name=?",
          [value.listjob, value.checkrun, value.trainning, value.name],
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
function updateCheckSTTByUID(UID, check) {
  try {
    if (UID && check) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE liststt SET check_info=? WHERE link_stt=?",
          [check, UID],
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
function updateLeverAndProbByUID(UID, lv, problem, created) {
  try {
    if (UID && lv && problem && created) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE accountfb SET lever=?, problem=?, created=? WHERE id_fb=?",
          [lv, problem, created, UID],
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
// function updateProbByUID(UID, problem, created){
//     try{
//         if (UID && problem && created){
//             var defer= q.defer();
//             mysql.getConnection((err, connection) => {
//                     if(err) return defer.reject(err);
//                     connection.query("UPDATE accountfb SET problem=?, created=? WHERE id_fb=?",
//                     [problem, created, UID], function(err,result){
//                         connection.release(); // return the connection to pool
//                         if(err){
//                             defer.reject(err);
//                         }else {
//                             defer.resolve(result);
//                         }
//                     });
//             });
//             return defer.promise;
//         };
//         return false;
//     } catch (err){
//         console.log(err);
//         return false;
//     };
// };
function updateTrackerProbByUID(UID, track) {
  try {
    if (UID && track) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE accountfb SET number_track=? WHERE id_fb=?",
          [track, UID],
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
function updateNumCheckWebByKey(numcheck, keyval) {
  try {
    if (numcheck && keyval) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE listweb SET numcheck=? WHERE keyval=?",
          [numcheck, keyval],
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
function updateArrByKey(data, keyval) {
  try {
    if (data && keyval) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE listweb SET arr=? WHERE keyval=?",
          [data, keyval],
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
function updateDataByKey(data, keyval) {
  try {
    if (data && keyval) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE listweb SET data=? WHERE keyval=?",
          [data, keyval],
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
function updateRunByKey(run, keyval) {
  try {
    if (run && keyval) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE listweb SET run=? WHERE keyval=?",
          [run, keyval],
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
function updateChangeJobByName(name, change) {
  try {
    if (name && change) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "UPDATE job SET checkrun=? WHERE name=?",
          [change, name],
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
function updateTrainJobByName(name, trainning) {
  try {
    if (name && trainning) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);

        connection.query(
          "UPDATE job SET trainning=? WHERE name=?",
          [trainning, name],
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
function getNumberLogin() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT user_name, number_login, iduser FROM accountfblogin",
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
function getFBnotCookie() {
  try {
    var defer = q.defer();
    mysql.getConnection((err, connection) => {
      if (err) return defer.reject(err);
      connection.query(
        "SELECT user_name,password FROM accountfblogin WHERE cookies IS NULL LIMIT 1",
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

function deleteUser(user) {
  try {
    if (user) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM accountfblogin WHERE user_name=?",
          [user],
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
function deleteUserbyID(iduser) {
  try {
    if (iduser) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM accountfblogin WHERE iduser=?",
          [iduser],
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

function deleteFbProblem(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM accountfb WHERE id_fb=?",
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
function deleteKeyFb(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM keyfind WHERE keyword=?",
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
function deleteKeytrain(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM keytrain WHERE keytrain=?",
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
function deleteJobByName(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM job WHERE name=?",
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
function deleteKeyWebByKey(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM listweb WHERE keyval=?",
          [id],
          function (err, result) {
            connection.release(); //return the connection to pool
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
function deleteTimeRunAutoByID(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM timeloadautofb WHERE id=?",
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
function deleteIDContentByUID(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM historystt WHERE id_fb=?",
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
function deleteIDArletByUID(id) {
  try {
    if (id) {
      var defer = q.defer();
      mysql.getConnection((err, connection) => {
        if (err) return defer.reject(err);
        connection.query(
          "DELETE FROM liststt WHERE id_fb=?",
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
function removeVietnameseTones(str) {
  try {
    str = str.replaceAll(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replaceAll(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replaceAll(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replaceAll(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replaceAll(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replaceAll(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replaceAll(/đ/g, "d");
    str = str.replaceAll(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "a");
    str = str.replaceAll(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "e");
    str = str.replaceAll(/Ì|Í|Ị|Ỉ|Ĩ/g, "i");
    str = str.replaceAll(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "o");
    str = str.replaceAll(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "u");
    str = str.replaceAll(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "y");
    str = str.replaceAll(/Đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replaceAll(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replaceAll(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replaceAll(/ + /g, " ");
    str = str.trim();
    str = str.replaceAll(/ /g, "");
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replaceAll(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      ""
    );
    str = str.toLowerCase();
    return str;
  } catch (err) {
    console.log(err);
    return false;
  }
}
module.exports = {
  deleteUser: deleteUser,
  deleteUserbyID: deleteUserbyID,
  deleteFbProblem: deleteFbProblem,
  deleteKeyFb: deleteKeyFb,
  deleteKeytrain: deleteKeytrain,
  deleteJobByName: deleteJobByName,
  deleteKeyWebByKey: deleteKeyWebByKey,
  deleteIDContentByUID: deleteIDContentByUID,
  deleteIDArletByUID: deleteIDArletByUID,
  deleteTimeRunAutoByID: deleteTimeRunAutoByID,
  addAcoutFb: addAcoutFb,
  addFbProblem: addFbProblem,
  addKeyFb: addKeyFb,
  addKeyWeb: addKeyWeb,
  addUIDContent: addUIDContent,
  addKeytrain: addKeytrain,
  addFbStt: addFbStt,
  addJob: addJob,
  addTimeAuto: addTimeAuto,
  getAllFbStt: getAllFbStt,
  getAllFbProb: getAllFbProb,
  getAllKeyFb: getAllKeyFb,
  getAllJob: getAllJob,
  getAllTimeRunAuto: getAllTimeRunAuto,
  getKeyFb: getKeyFb,
  getAllKeytrain: getAllKeytrain,
  getAllKeyWeb: getAllKeyWeb,
  getAllUIDContent: getAllUIDContent,
  getKeytrain: getKeytrain,
  getKeyWebByKey: getKeyWebByKey,
  getJobByName: getJobByName,
  getUIDContentByUID: getUIDContentByUID,
  getFBProbByUID: getFBProbByUID,
  getAllFBProb: getAllFBProb,
  getSTTProbByUID: getSTTProbByUID,
  getSTTProbByFBID: getSTTProbByFBID,
  getSTTProbCheckNoByFBID: getSTTProbCheckNoByFBID,
  getAcoutFbbyEmail: getAcoutFbbyEmail,
  getAllSTTProb: getAllSTTProb,
  getCookies: getCookies,
  getNumberLogin: getNumberLogin,
  getFBnotCookie: getFBnotCookie,
  getFBProbByTimes: getFBProbByTimes,
  getTimebyTime: getTimebyTime,
  updateCookiebyEmail: updateCookiebyEmail,
  updateNumberKeybyKey: updateNumberKeybyKey,
  updateJobByName: updateJobByName,
  updateCheckSTTByUID: updateCheckSTTByUID,
  updateNumberLoginbyEmail: updateNumberLoginbyEmail,
  updateChangeJobByName: updateChangeJobByName,
  updateTrainJobByName: updateTrainJobByName,
  updateLeverAndProbByUID: updateLeverAndProbByUID,
  updateTrackerProbByUID: updateTrackerProbByUID,
  updateArrByKey: updateArrByKey,
  updateDataByKey: updateDataByKey,
  updateRunByKey: updateRunByKey,
  updateNumCheckWebByKey: updateNumCheckWebByKey,
  removeVietnameseTones: removeVietnameseTones,
};
