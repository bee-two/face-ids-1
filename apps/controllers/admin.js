var express = require("express");
// var randToken = require ("rand-token");
var router = express.Router();
var user_md = require("../models/user");
var post_md = require("../models/post");
var helper = require("../helpers/helper");
var jwt = require("jsonwebtoken");
const beams = {
  instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
  secretKey: "D602CFC742F3C10B747DB1D4F65E310851A5627F6A573F17239B1395AB2D6562"
}; 
//const DOMAIN = "https://face-ids.herokuapp.com";
const SECRET_REFRESH = "SECRET_REFRESH_BEE_220296@mebe";
const REFRESHTOKENLIFE = 2592000;
//var config = require("config");
//const dotenv = require('dotenv').config();
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 3,
  message: "Status: 404, Not found",
}); //giới hạn IP truy cập không quá 5 lần / 30p
process.env.TZ = "Asia/Bangkok";
const PushNotifications = require("@pusher/push-notifications-server");
//const { async } = require("q");
const beamsClient = new PushNotifications({
  instanceId: beams.instanceId,
  secretKey: beams.secretKey,
});
async function getNewStatus(data) {
  // lấy thông tin user từ máy chủ
  try {
    var dataUsers = await user_md.getNameUsers();
    if (
      dataUsers != "" &&
      dataUsers != [] &&
      dataUsers != undefined &&
      dataUsers !== false
    ) {
      if (data == "post")
        var optionData = "Admin vừa đăng bài viết mới! Xem ngay =))";
      if (data != "post")
        var optionData = 'Account: "' + data + '" is logined!!!';
      for (var i = 0; i < dataUsers.length; i++) {
        beamsClient.publishToInterests([dataUsers[i].id + "notifi"], {
          apns: {
            aps: {
              alert: {
                title: dataUsers.last_name,
                body: optionData,
              },
            },
          },
          fcm: {
            notification: {
              title: dataUsers.last_name,
              body: optionData,
            },
          },
          web: {
            notification: {
              title: dataUsers.last_name,
              body: optionData
              // ,icon: DOMAIN + "/static/favicon.ico",
              // deep_link: DOMAIN + "/blog",
            },
          },
        });
      }
    }
  } catch (err) {
    console.log("getNotification err: ", err);
  }
}
router.get("/", function (req, res) {
  var trackper = req.session.trackper;
  if (req.session.user && trackper == 1) {
    var data = post_md.getAllPosts();
    data
      .then(function (posts) {
        var data = {
          posts: posts,
          requser: req.session.user.last_name,
          user: req.session.user,
          trackper: trackper,
          error: false,
        };
        return res.render("admin/dashboard", { data: data });
      })
      .catch(function (err) {
        console.log(err);
        var data = {
          user: req.session.user,
          trackper: req.session.trackper,
          requser: req.session.user.last_name,
          error: "Không thể lấy dữ liệu Posts",
        };
        return res.render("admin/dashboard", { data: data });
      });
  } else {
    console.log("Yêu cầu User từ admin/dashboard");
    return res.redirect("/admin/signin");
  }
});
// router.get("/admin/post", function(req, res){
//     var trackper=req.session.trackper;
// //    console.log(trackper);
// if (req.session.user && trackper==1){
//     return res.redirect("/admin");
// } else {
//     return res.redirect("/admin/signin");
// };
// });

router.get("/signup", function (req, res) {
  var trackper = req.session.trackper;
  //    console.log(trackper);
  if (req.session.user && trackper == 1) {
    return res.render("signup", { data: {} });
  } else {
    return res.redirect("/admin/signin");
  }
});

router.post("/signup", function (req, res) {
  var userDB = req.body;
  var dataTrack = user_md.getUserbyEmail(userDB.email.toLowerCase());
  dataTrack
    .then(function (users) {
      var userDB = users[0];
      // console.log(userDB);
      if (userDB != undefined) {
        return res.render("signup", {
          data: { error: "Tài khoản đã tồn tại" },
        });
      } else {
        var user = req.body;
        //console.log(user);
        if (user.password != user.repassword) {
          return res.render("signup", {
            data: { error: "Xác nhận Mật khẩu chưa đúng" },
          });
        } else {
          //insert to DB
          var password = helper.hash_password(user.password);
          var permission = helper.hash_password(user.permission);
          var now = new Date().toLocaleString("vi-VN");
          user = {
            email: user.email.toLowerCase(),
            password: password,
            permission: permission,
            last_name: user.lastname,
            created_at: now,
            updated_at: now,
          };
          var result = user_md.addUser(user);
          result
            .then(function (data) {
              //console.log(result);
              return res.redirect("/admin/user");
            })
            .catch(function (err) {
              //console.log(err);
              return res.render("signup", {
                data: { error: "Lỗi tạo tài khoản 1" },
              });
            });
        }
      }
    })
    .catch(function (err) {
      console.log(err);
      var data = {
        error: "Lỗi tạo tài khoản 2",
      };
      return res.render("signup", { data: data });
    });
});

router.get("/signin", limiter, function (req, res) {
  if (req.session.user) {
    res.cookie("refreshToken", null, {
      maxAge: 1,
      // domain: 'faceblogs.onrender.com',
      // path: '/giaoviec',
      httpOnly: true,
      // secure: true
    });

    var email = req.session.user.email;
    req.session.user = null;
    return res.render("signin", {
      data: { error: "Bạn đã đăng xuất tài khoản: " + email },
    });
    // console.log("token luc out: ",req.cookies);
  } else {
    return res.render("signin", { data: {} });
    // return return res.redirect("/admin/signin");
  }
});

router.post("/signin", async function (req, res) {
  var params = req.body;
  if (params.email.trim().length == 0 || params.password.trim().length == 0) {
    return res.render("signin", {
      data: { error: "Bạn chưa nhập Username hoặc password" },
    });
  } else if (
    params.email.toLowerCase() == "adminbee" &&
    params.password == "Bee123@1001!"
  ) {
    //var data=user_md.getUserbyEmail(params.email.toLowerCase());
    try {
      var user = {
        id: 0,
        email: "adminbee",
        last_name: "AdminZero",
        permission: "$2b$10$JS87Ukb2dJYFzepzulMHkeHkhuujAN9IINg0mzxvfx8U6Oz0pnYG2",
        trackper: 1,
      };
      req.session.user = user;
      req.session.trackper = 1;
      var refreshToken = jwt.sign(
        { id: user.id, email: user.email, permission: user.trackper },
        SECRET_REFRESH,
        { expiresIn: REFRESHTOKENLIFE }
      );
      res.cookie("refreshToken", refreshToken, {
        maxAge: REFRESHTOKENLIFE * 1000,
        // domain: 'faceblogs.onrender.com',
        // path: '/giaoviec',
        httpOnly: true,
        secure: true,
      });
      getNewStatus(user.email);
      return res.redirect("/admin/user");
    } catch (err) {
      console.log(err);
      var data = {
        error: "Tài khoản không tồn tại",
      };
      return res.render("signin", { data: data });
    }
  } else {
    var data = user_md.getUserbyEmail(params.email.toLowerCase());
    data
      .then(function (users) {
        var user = users[0];
        var status = helper.compare_password(params.password, user.password);
        if (status) {
          req.session.user = user;
          req.session.permission = user.permission;
          if (helper.compare_password("1", user.permission)) {
            req.session.trackper = 1;
          } else if (helper.compare_password("2", user.permission)) {
            req.session.trackper = 2;
          } else if (helper.compare_password("3", user.permission)) {
            req.session.trackper = 3;
          }
          // var token = jwt.sign({id: user.id, mail: user.mail, permission: user.trackper}, process.env.SECRET, { expiresIn: process.env.TOKENLIFE }) ;//3 ngày
          var refreshToken = jwt.sign(
            {
              id: user.id,
              email: user.email,
              permission: req.session.trackper,
            },
            "SECRET_REFRESH_BEE_220296@mebe",
            { expiresIn: 2592000 }
          );
          // res.cookie('token', token, {
          //     maxAge: process.env.TOKENLIFE*1000,
          //     // domain: 'faceblogs.onrender.com',
          //     // path: '/giaoviec',
          //     httpOnly: true,
          //     // secure: true
          // });
          res.cookie("refreshToken", refreshToken, {
            maxAge: 2592000 * 1000,
            // domain: 'faceblogs.onrender.com',
            // path: '/giaoviec',
            httpOnly: true,
            secure: true,
          });
          // refreshTokens[refreshToken] = response
          // return res.json(response);
          getNewStatus(user.email);
          var saveTK = {
            email: user.email,
            refreshToken: refreshToken,
          };
          //save refreshToken to DB

          var saveToken = user_md.updateTokenbyEmail(saveTK);
          if (req.session.trackper == 1) {
            return res.redirect("/stream-facebook");
          } else if (req.session.trackper == 2) {
            return res.redirect("/giaoviec");
          } else if (req.session.trackper == 3) {
            return res.redirect("/track");
          }
          //console.log(2)
          // return res.json(response);
        } else {
          return res.render("signin", { data: { error: "Sai mật khẩu" } });
        }
      })
      .catch(function (err) {
        console.log(err);
        var data = {
          error: "Tài khoản không tồn tại",
        };
        return res.render("signin", { data: data });
      });
  }
});

router.get("/post/new", function (req, res) {
  if (req.session.user) {
    var data = {
      user: req.session.user,
      trackper: req.session.trackper,
      requser: req.session.user.last_name,
      error: false,
    };
    return res.render("admin/post/new", { data: data });
  } else {
    return res.redirect("/admin/signin");
  }
});

router.post("/post/new", function (req, res) {
  if (req.session.trackper == 1) {
    var params = req.body;
    var data = {
      user: req.session.user,
      trackper: req.session.trackper,
      requser: req.session.user.last_name,
    };
    if (params.title.trim().length == 0) {
      data.error = "Bạn chưa nhập tiêu đề";
      return res.render("admin/post/new", { data: data });
    } else {
      var today = new Date().toLocaleString("vi-VN");
      params.created_at = today;
      params.updated_at = today;
      var dataDB = post_md.addPost(params);
      dataDB
        .then(function (result) {
          getNewStatus("post");
          return res.redirect("/admin");
        })
        .catch(function (err) {
          console.log(err);
          data.error = "Không thể thêm bài viết";
          return res.render("admin/post/new", { data: data });
        });
    }
  } else {
    return res.redirect("/admin/signin");
  }
});
router.get("/post/edit/:id", function (req, res) {
  if (req.session.trackper == 1) {
    var params = req.params;
    var id = params.id;
    var data = post_md.getPostByID(id);
    if (data) {
      data
        .then(function (posts) {
          var post = posts[0];
          var data = {
            post: post,
            user: req.session.user,
            trackper: req.session.trackper,
            requser: req.session.user.last_name,
            error: false,
          };
          return res.render("admin/post/edit", { data: data });
        })
        .catch(function (err) {
          console.log(err);
          var data = {
            user: req.session.user,
            trackper: req.session.trackper,
            requser: req.session.user.last_name,
            error: "Không tìm thấy ID bài viết",
          };
          return res.render("admin/post/edit", { data: data });
        });
    } else {
      var data = {
        user: req.session.user,
        trackper: req.session.trackper,
        requser: req.session.user.last_name,
        error: "Không tìm thấy ID bài viết",
      };
      return res.render("admin/post/edit", { data: data });
    }
  } else {
    return res.redirect("/admin/signin");
  }
});

router.put("/post/edit", function (req, res) {
  var params = req.body;
  var data = post_md.updatePost(params);
  //console.log(data);
  if (!data) {
    return res.json({ status_code: 500 });
  } else {
    data
      .then(function (result) {
        getNewStatus("post");
        return res.json({ status_code: 200 });
      })
      .catch(function (err) {
        console.log(err);
        return res.json({ status_code: 500 });
      });
  }
});

router.delete("/post/delete", function (req, res) {
  var post_id = req.body.id;
  var data = post_md.deletePost(post_id);
  if (!data) {
    return res.json({ status_code: 500 });
  } else {
    data
      .then(function (result) {
        return res.json({ status_code: 200 });
      })
      .catch(function (err) {
        console.log(err);
        return res.json({ status_code: 500 });
      });
  }
});

router.delete("/delete", function (req, res) {
  var user_id = req.body.id;
  var data = user_md.deleteUser(user_id);
  if (!data) {
    return res.json({ status_code: 500 });
  } else {
    data
      .then(function (result) {
        return res.json({ status_code: 200 });
      })
      .catch(function (err) {
        console.log(err);
        return res.json({ status_code: 500 });
      });
  }
});

router.get("/post", function (req, res) {
  if (req.session.user) {
    return res.redirect("/admin");
  } else {
    return res.redirect("/admin/signin");
  }
});

router.get("/user", function (req, res) {
  if (req.session.user && req.session.trackper == 1) {
    var data = user_md.getAllUsers();
    var trackper = req.session.trackper;
    data
      .then(function (users) {
        var data = {
          users: users,
          requser: req.session.user.last_name,
          user: req.session.user,
          trackper: trackper,
          error: false,
        };
        for (var i = 0; i < data.users.length; i++) {
          if (helper.compare_password("1", data.users[i].permission)) {
            data.users[i].trackper = "Quản trị viên";
          } else if (helper.compare_password("2", data.users[i].permission)) {
            data.users[i].trackper = "Đội An ninh";
          } else if (helper.compare_password("3", data.users[i].permission)) {
            data.users[i].trackper = "Tài khoản khách";
          } else {
            data.users[i].trackper = "Vô hiệu";
          }
        }
        return res.render("admin/user", { data: data });
      })
      .catch(function (err) {
        console.log(err);
        var data = { error: "Không có thông tin User trong hệ thống" };
        return res.render("admin/user", { data: data });
      });
  } else {
    return res.redirect("/admin/signin");
  }
});

module.exports = router;
