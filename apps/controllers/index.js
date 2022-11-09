const express = require("express");
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const fs = require("fs");
var router = express.Router();
var user_md = require("../models/user");
var post_md = require("../models/post");
var todos_md = require("../models/nodetodos");
var user_md_ppt = require("../models/user_ppt");
//var axios=require('axios');
// var user_md_ppt=require("../models/user_ppt");
// var axiosScan=require("../models/axiosscanweb");
var runFuncFile = require("../models/asyncautoload_ppt");
//var teststreamFB=require("../models/asyncfunction");
var helper = require("../helpers/helper");
const schedule = require("node-schedule");
//const { param } = require("./blog");
//const { Console } = require("console");
var jwt = require("jsonwebtoken");
//var config = require("config");
//const dotenv = require('dotenv').config();
const rateLimit = require("express-rate-limit");
//const DOMAIN = "https://face-ids.herokuapp.com";
const beams = {
  instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
  secretKey: "D602CFC742F3C10B747DB1D4F65E310851A5627F6A573F17239B1395AB2D6562"
};
const limiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 3,
  message: "Status: 404, Not found",
}); //giới hạn IP truy cập không quá 5 lần / 30p

process.env.TZ = "Asia/Bangkok";
router.use("/admin", require(__dirname + "/admin"));
//router.use("/blog", require(__dirname+"/blog"));
const PushNotifications = require("@pusher/push-notifications-server");
// const { async } = require("q");
// const { getMaxListeners } = require("process");
const beamsClient = new PushNotifications({
  instanceId: beams.instanceId,
  secretKey: beams.secretKey,
});

//console.log(beamsClient)
//getNotification(1); //server is started!

// async function checkStream (){
//     var datatext='lấp vò';
//     await teststreamFB.launchPuppeteer();
//     await teststreamFB.loginfacebookwithUser('lhkduy01@gmail.com','010414bee@');
//     //var output =await teststreamFB.searchPagesOrgroups(datatext);
//     //console.log('output: '+output)
//     //await teststreamFB.launchPuppeteer();
// };
// checkStream()
const job = schedule.scheduleJob("0 7 * * *", function () {
  var days = [];
  var lates = [];
  var users = [];
  var datausers = user_md.getNameUsers();
  var latenoti = todos_md.getCountInfoTodoLatebyID();
  var daynoti = todos_md.getCountInfoTodoDaybyID();
  console.log("Run Push Notification!");
  datausers.then(function (userss) {
    for (var i = 0; i < userss.length; i++) {
      if (helper.compare_password("2", userss[i].permission)) {
        users.push(userss[i].id);
        days[userss[i].id + ""] = 0;
        lates[userss[i].id + ""] = 0;
      }
    }
    latenoti.then(function (late) {
      if (late.length > 0) {
        for (var i = 0; i < users.length; i++) {
          for (var j = 0; j < late.length; j++) {
            if (users[i] == late[j].id_user) {
              lates[users[i] + ""] = lates[users[i] + ""] + 1;
            }
          }
        }
      }

      daynoti.then(function (day) {
        if (day.length > 0) {
          for (var i = 0; i < users.length; i++) {
            for (var j = 0; j < day.length; j++) {
              if (users[i] == day[j].id_user) {
                days[users[i] + ""] = days[users[i] + ""] + 1;
              }
            }
          }
        }
        for (var i = 0; i < users.length; i++) {
          if (days[users[i] + ""] > 0) {
            var optionData =
              "Hôm nay có (" +
              days[users[i] + ""] +
              ") việc, Trễ (" +
              lates[users[i] + ""] +
              ")";
            var titleUser = "Admin";
            beamsClient
              .publishToInterests([users[i] + "notifi"], {
                apns: {
                  aps: {
                    alert: {
                      title: titleUser,
                      body: optionData,
                    },
                  },
                },
                fcm: {
                  notification: {
                    title: titleUser,
                    body: optionData,
                  },
                },
                web: {
                  notification: {
                    title: titleUser,
                    body: optionData
                    // ,icon: DOMAIN + "/static/favicon.ico",
                    // deep_link: DOMAIN + "/giaoviec",
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
        }
      });
    });
  });
});

var jobAuto = [];
//lịch quét FB vào các mốc thời gian trong ngày
async function RunAutoFacebook() {
  try {
    console.log("Start RunAutoFacebook");
    //var numcheckbtn=1;
    //Vô hiệu hóa tất cả công việc cũ
    if (
      jobAuto != undefined &&
      jobAuto != [] &&
      jobAuto !== false &&
      jobAuto !== ""
    ) {
      for (var j = 0; j < jobAuto.length; j++) {
        jobAuto[j].cancel();
      }
      jobAuto = [];
    }
    // Lấy ra và thêm công việc mới
    var ListTimes = await user_md_ppt.getAllTimeRunAuto();
    if (
      ListTimes == undefined ||
      ListTimes === false ||
      ListTimes == [] ||
      ListTimes == ""
    )
      return false;
    console.log("Run Auto: ", ListTimes.length, " Times");
    for (var i = 0; i < ListTimes.length; i++) {
      jobAuto.push(
        schedule.scheduleJob(
          ListTimes[i].creat_minute + " " + ListTimes[i].creat_hour + " * * *",
          async function () {
            //for (var j= 0;j<numcheckbtn;j++){
            await runFuncFile.runFuncFile();
            await getNotification(0);
            //};
          }
        )
      );
    }
  } catch (err) {
    console.log(err);
  }
}


//newrunFuncFile();
async function newrunFuncFile() {
  try {
    await runFuncFile.runFuncFile();
  } catch (err) {
    console.log(err);
  }
}

//hàm đặt lại lịch quét
const jobRunAutoFB = schedule.scheduleJob("30 3 * * *", async function () {
  await RunAutoFacebook();
});
RunAutoFacebook();
// gửi thông tin cho người dùng về kết quả quét facebook
// const job_ppt3 = schedule.scheduleJob('0 9 * * *', async function(){
//     // lấy kết quả ra từ server
//     await getNotification();
// });
async function getNotification(StartSV) {
  // lấy thông tin user từ máy chủ
  try {
    var dataUsers = await user_md.getNameUsers();
    var FBProb = await user_md_ppt.getFBProbByTimes(1, 1); // gồm lever và số ngày liền trước
    if (
      dataUsers != "" &&
      dataUsers != [] &&
      dataUsers != undefined &&
      dataUsers !== false &&
      StartSV == 1
    ) {

      var startData = "Server face-ids is started!";
      for (var i = 0; i < dataUsers.length; i++) {
        beamsClient.publishToInterests([dataUsers[i].id + "notifi"], {
          apns: {
            aps: {
              alert: {
                title: dataUsers.last_name,
                body: startData,
              },
            },
          },
          fcm: {
            notification: {
              title: dataUsers.last_name,
              body: startData,
            },
          },
          web: {
            notification: {
              title: dataUsers.last_name,
              body: startData
              // ,icon: DOMAIN + "/static/favicon.ico",
              // deep_link: DOMAIN + "/giaoviec",
            },
          },
        });
      }
    }
    //console.log('get FB prob Notif',FBProb)
    if (
      FBProb != [] &&
      FBProb != undefined &&
      FBProb !== false &&
      FBProb.length > 0
    ) {
      //console.log('get FB prob Notif',FBProb)
      var numbcheckInfo = 0;
      // lấy ra số lượng STT mới
      for (var j = 0; j < FBProb.length; j++) {
        var checkstt = await user_md_ppt.getSTTProbCheckNoByFBID(
          FBProb[j].id_fb
        );
        //console.log('get checkstt prob Notif')
        if (
          checkstt != [] &&
          checkstt != "" &&
          checkstt != undefined &&
          checkstt != false &&
          checkstt.length > 0
        ) {
          numbcheckInfo = numbcheckInfo + checkstt.length;
          //update check_info
          for (var z = 0; z < checkstt.length; z++) {
            try {
              await user_md_ppt.updateCheckSTTByUID(
                checkstt[z].link_stt,
                checkstt[z].check_info + 1
              );
            } catch (err) {}
          }
        }
      }
      if (numbcheckInfo == 0) return false;
      var optionData =
        "Phát hiện: " + numbcheckInfo + " Status facebook danger";
      console.log("get push Notification");
    } else {
      return false;
    }
    if (
      dataUsers != "" &&
      dataUsers != [] &&
      dataUsers != undefined &&
      dataUsers !== false
    ) {
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
              // deep_link: DOMAIN + "/auto-facebook",
            },
          },
        });
      }
    }
  } catch (err) {
    console.log("getNotification err: ", err);
  }
}

async function getNotifiTrackIP(data) {
  // lấy thông tin user từ máy chủ
  try {
    console.log("get push Track IP");
    var dataUsers = await user_md.getNameUsers();
    if (data == "" || data == [] || data == undefined) return false;
    var optionData = "Cắn câu: " + data + ". Kiểm tra!!!";
    if (
      dataUsers != "" &&
      dataUsers != [] &&
      dataUsers != undefined &&
      dataUsers !== false
    ) {
      for (var i = 0; i < dataUsers.length; i++) {
        //if (dataUsers[i].id==id_user || req.session.trackper==1){
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
              // deep_link: DOMAIN + "/data/" + data,
            },
          },
        });
        //};
      }
    }
  } catch (err) {
    console.log("getNotification err: ", err);
  }
}
function checkToken(req, res, next) {
  var refreshToken = null;
  if (req.cookies && req.cookies.refreshToken)
    refreshToken = req.cookies.refreshToken;
  //var timning =  (new Date()).getHours +''+  (new Date()).getMinutes;
  if (!req.session.user && refreshToken) {
    jwt.verify(
      refreshToken,
      "SECRET_REFRESH_BEE_220296@mebe",
      function (err, decoded) {
        if (err) {
          console.error(err.toString());
          return res.redirect("/admin/signin");
        }
        var refreshTokenDB = user_md.getUserbyEmail(decoded.email);
        refreshTokenDB
          .then(function (users) {
            var user = users[0];
            //console.log(user);
            if (helper.compare_password("1", user.permission)) {
              req.session.trackper = 1;
            } else if (helper.compare_password("2", user.permission)) {
              req.session.trackper = 2;
            } else if (helper.compare_password("3", user.permission)) {
              req.session.trackper = 3;
            }
            req.session.user = user;
            req.session.permission = user.permission;
            next();
          })
          .catch(function (err) {
            //console.log(err);
            return res.redirect("/admin/signin");
          });
      }
    );
  } else if (req.session.user && req.session.trackper) {
    next();
  } else {
    return res.redirect("/admin/signin");
  }
}

router.get("/", limiter, function (req, res) {
  return res.redirect("https://www.google.com/");
});
router.get("/blog", limiter, function (req, res) {
  //console.log(req);
  console.log(req["hostname"]);

  // var data=post_md.getAllPosts();
  // data.then(function(posts){
  //     var data={
  //         posts:posts,
  //         error: false
  //     };
  //     return res.render("blog/index",{data:data});
  return res.redirect("https://www.google.com/");
  // }).catch(function(err) {
  //     var data={error: "Không thể lấy dữ liệu Blog (Database không hoạt động)."};
  //     console.log(err);
  //     return res.render("blog/index",{data:data});
  // });
  //  return res.render("blog/index");
});

router.get("/chat", function (req, res) {
  if (req.session.trackper < 3) {
    data = {
      user: req.session.user,
      trackper: req.session.trackper,
      requser: req.session.user.last_name,
      error: false,
    };
    return res.render("chat", { data: data });
  } else {
    return res.redirect("/admin/signin");
  }
});
// router streaming gọi dữ liệu từ puppeteer
router.get("/stream-facebook", checkToken, function (req, res) {
  if (req.session.trackper <= 1) {
    try {
      //await RunAutoFacebook();
      var data = {
        user: req.session.user,
        trackper: req.session.trackper,
        requser: req.session.user.last_name,
        error: false,
      };
      return res.render("streamppt", { data: data });
    } catch (err) {
      console.log(err);
      return res.redirect("/admin/signin");
    }
  } else {
    return res.redirect("/admin/signin");
  }
});
router.get("/auto-facebook", checkToken, async function (req, res) {
  if (req.session.trackper <= 1) {
    await RunAutoFacebook();
    var data = {
      user: req.session.user,
      trackper: req.session.trackper,
      requser: req.session.user.last_name,
      error: false,
    };
    return res.render("autoppt", { data: data });
  } else {
    return res.redirect("/admin/signin");
  }
});
// router.get("/scan-domain",checkToken,async function(req,res){
//     if (req.session.trackper<=2){
//         var data0 = await user_md_ppt.getAllKeyWeb();
//         if (data0 ==undefined || data0==[] || data0===false) data0=[];
//         var data={
//             user: req.session.user,
//             trackper: req.session.trackper,
//             requser: req.session.user.last_name,
//             data: data0,
//             error:false
//         };
//         res.render("scanaxios",{data:data});
//     }else{
//         res.redirect("/admin/signin");
//     };
// });
router.get("/admin/updateuser/:id", function (req, res) {
  if (req.session.user) {
    var params = req.params;
    var id = params.id;
    var data = user_md.getUserbyID(id);

    data
      .then(function (users) {
        var user = users[0];
        var data = {
          user: user,
          error: false,
        };
        return res.render("admin/updateuser", { data: data });
      })
      .catch(function (err) {
        var data = {
          error: "Không tìm thấy ID User",
        };
        return res.render("admin/updateuser", { data: data });
      });
  } else {
    return res.redirect("/admin/signin");
  }
});

router.put("/admin/updateuser", function (req, res) {
  var params = req.body;
  if (params.password == params.repassword) {
    var password = helper.hash_password(params.password);
    params.password = password;
    var data = user_md.updateUser(params);
  } else {
    var data = null;
  }
  if (!data) {
    return res.json({ status_code: 500 });
  } else {
    data
      .then(function (result) {
        return res.json({ status_code: 200 });
      })
      .catch(function (err) {
        return res.json({ status_code: 500 });
      });
  }
});

router.post("/upload", multipartMiddleware, function (req, res) {
  if (req.session.user) {
    try {
      fs.readFile(req.files.upload.path, function (err, data) {
        var file = data.toString("base64");
        var img = Buffer.from(file, "base64");
        var finalImg = {
          id:
            "bee_photo_" +
            new Date().valueOf() +
            "." +
            req.files.upload.type.split("/", 2)[1],
          img: img,
          type: req.files.upload.type,
        };
        var addImg = post_md.addDataImg(finalImg);
        addImg
          .then(function (data) {
            let fileName = finalImg.id;
            let url = "/photo/" + fileName;
            let msg = "Upload thành công!";
            let funcNum = req.query.CKEditorFuncNum;
            return res
              .status(201)
              .send(
                "<script>window.parent.CKEDITOR.tools.callFunction('" +
                  funcNum +
                  "','" +
                  url +
                  "','" +
                  msg +
                  "');</script>"
              );
          })
          .catch(function (err) {
            console.log(err);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    return res.redirect("/admin/signin");
  }
});
router.post("/upload-track", multipartMiddleware, function(req,res){
  //console.log("req.body: ",req.body);
  try {
      var imageTrack = req.body;
      if (!imageTrack) return res.json({status:500});
      function decodeBase64Image(dataString) {
          var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
          if (matches.length !== 3) return false;
          response = Buffer.from(matches[2], 'base64');
          return response;
        };
          if (decodeBase64Image(imageTrack.img)==false) return res.status(500);
          var finalImg={
              id: imageTrack.id,
              img: decodeBase64Image(imageTrack.img),
              type: imageTrack.type
          }
          var addImg=post_md.addDataImg(finalImg);
          addImg.then(function(data){
              console.log("Upload Img Success: ", imageTrack.id)
              return res.json({status:200});
          }).catch(function(err){
              console.log("Upload Img Fail: ",err)
              return res.json({status:500});
          });

      //});
     } catch (error) {
         //console.log(error.message);
         return res.json({status:500});
     };
});
router.get("/listimg", (req, res) => {
  if (req.session.user) {
    var listIDImgs = post_md.getDataAllImg();
    listIDImgs
      .then(function (listID) {
        var data = {
          listID: listID,
        };
        return res.render("listimg", { data: data });
      })
      .catch(function (err) {
        return res.statusCode(401).json(err);
      });
  } else {
    return res.redirect("/admin/signin");
  }
});
router.delete("/deleteimg", (req, res) => {
  if (req.session.user) {
    var id = req.body.id;
    var IDImgs = post_md.deleteDataImg(id);
    IDImgs.then(function (listID) {
      return res.json({ status_code: 200 });
    }).catch(function (err) {
      console.log(err);
      return res.json({ status_code: 500 });
    });
  } else {
    return res.redirect("/admin/signin");
  }
});
router.get("/photo/:id", (req, res) => {
  var filename = req.params.id;
  var dataphoto = post_md.getDataImg(filename);
  dataphoto
    .then(function (photo) {
      var file = photo[0].img;
      return res.contentType(photo[0].type).send(file);
    })
    .catch(function (err) {
      console.log(err);
    });
});

router.get("/track", checkToken, function (req, res) {
  if (req.session.user) {
    if (req.session.trackper == 1) {
      var data = post_md.getAllPostsIp();
    } else {
      var data = post_md.getAllPostsIpbyUser(req.session.user.id);
    }
    data
      .then(function (postsip) {
        var data = {
          postsip: postsip,
          user: req.session.user,
          trackper: req.session.trackper,
          requser: req.session.user.last_name,
          error: false,
        };
        //them 1 blog
        return res.render("trackip/index", { data: data });
      })
      .catch(function (err) {
        console.log(err);
        var data = {
          user: req.session.user,
          trackper: req.session.trackper,
          requser: req.session.user.last_name,
          error: "Không thể lấy dữ liệu TrackIp",
        };
        return res.render("trackip/index", { data: data });
      });
  } else {
    return res.redirect("/admin/signin");
  }
});
router.get("/track/new", function (req, res) {
  if (req.session.user) {
    var data = {
      user: req.session.user,
      trackper: req.session.trackper,
      requser: req.session.user.last_name,
      error: false,
    };
    return res.render("trackip/new", { data: data });
  } else {
    return res.redirect("/admin/signin");
  }
});

router.post("/track/new", function (req, res) {
  var params = req.body;
  var user = {
    user: params,
  };
  var regex = /^[a-zA-Z0-9.+-]+$/; // Chỉ chấp nhận ký tự alphabet thường hoặc ký tự hoa
  var dataTrack = post_md.getPostIpbyTitle(removeVietnameseTones(params.title));
  dataTrack
    .then(function (postsip) {
      var postsip = postsip[0];
      //  console.log(postsip);
      if (
        (postsip != "" &&
          postsip != undefined &&
          postsip &&
          params.title.trim().length != 0) ||
        params.title.indexOf("admin") >= 0 ||
        params.title.indexOf("post") >= 0
      ) {
        user.error = "Tiêu đề 'title' đã tồn tại hoặc bị cấm";
        user.user.id = params.id_user;
        return res.render("trackip/new", { data: user });
      } else {
        if (params.title.trim().length == 0 || params.link.trim().length == 0) {
          user.error =
            "Bạn chưa nhập tiêu đề để hiển thị trên Link hoặc Link liên kết";
          user.user.id = params.id_user;
          return res.render("trackip/new", { data: user });
        } else if (!regex.test(params.title)) {
          user.error =
            "Bạn không được nhập ký tự đặc biệt, tiếng việt có dấu và khoảng cách vào 'Title'.";
          user.user.id = params.id_user;
          return res.render("trackip/new", { data: user });
        } else if (
          params.content.indexOf("src=") < 0 ||
          params.content.indexOf("<img") < 0
        ) {
          user.error =
            "Bạn phải thêm ảnh (image) cho mục 'Ảnh hiển thị lên Link'.";
          user.user.id = params.id_user;
          return res.render("trackip/new", { data: user });
        } else {
          var today = new Date().toLocaleString("vi-VN");
          params.created_at = today;
          if (params.check_geo==null || params.check_geo==undefined || params.check_geo==0) params.check_geo=0;
          if (params.check_img==null || params.check_img==undefined || params.check_img==0) params.check_img=0;
          data = post_md.addPostIp(params);
          data
            .then(function (result) {
              return res.redirect("/track");
            })
            .catch(function (err) {
              console.log(err);
              user.error = "Lỗi tạo liên kết 1.";
              user.user.id = params.id_user;
              return res.render("trackip/new", { data: user });
            });
        }
      }
    })
    .catch(function (err) {
      console.log(err);
      user.error = "Lỗi tạo liên kết 2.";
      user.user.id = params.id_user;
      return res.render("trackip/new", { data: user });
    });
});

router.delete("/track/delete", function (req, res) {
  var post_id = req.body.id;
  var dataid = post_md.deletePostIp(post_id);
  if (!dataid) {
    return res.json({ status_code: 500 });
  } else {
    dataid
      .then(function (result) {
        return res.json({ status_code: 200 });
      })
      .catch(function (err) {
        console.log(err);
        return res.json({ status_code: 500 });
      });
  }

  var post_title = req.body.title;
  var datatit = post_md.deleteDataIpbyTitle(post_title);
  if (!datatit) {
    return res.json({ status_code: 500 });
  } else {
    datatit
      .then(function (result) {
        return res.json({ status_code: 200 });
      })
      .catch(function (err) {
        console.log(err);
        return res.json({ status_code: 500 });
      });
  }
});
//profile.php?id=
//'/id=:id
router.get("/profile.php", function (req, res) {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    ipAddr = req.headers["x-forwarded-for"];
  } else {
    ipAddr = req.socket.remoteAddress;
  }
  var dataURL = "";
  if (
    req.query.id != undefined &&
    req.query.id != [] &&
    req.query.id != false &&
    req.query.id != ""
  ) {
    console.log(req.query.id);
    dataURL = removeVietnameseTones(req.query.id);
  }
  if (dataURL == "" || dataURL == undefined)
    return res.redirect("https://www.google.com/");
  var data = post_md.getPostIpbyTitle(dataURL);
  data
    .then(function (postsip) {
      if (
        postsip == [] ||
        postsip == "" ||
        postsip == false ||
        postsip == undefined ||
        postsip[0] == [] ||
        postsip[0] == "" ||
        postsip[0] == false ||
        postsip[0] == undefined
      )
        return res.redirect("https://www.google.com/");
      var postip = postsip[0];
      var result = {
        post: postip,
        getip: ipAddr,
        error: false,
      };
      //getNotifiTrackIP(dataURL,postip.id_user);
      return res.render("trackip/postip", { data: result });
    })
    .catch(function (err) {
      //    var result={
      //        error: "Không thể xem bài viết"
      //    };
      console.log(err);
      //    res.render("trackip/postip",{data:result});
      return res.redirect("https://www.google.com/");
    });
});
router.get("/permalink.php", function (req, res) {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    ipAddr = req.headers["x-forwarded-for"];
  } else {
    ipAddr = req.socket.remoteAddress;
  }
  var dataURL = "";
  if (
    req.query.story_fbid != undefined &&
    req.query.story_fbid != [] &&
    req.query.story_fbid != false &&
    req.query.story_fbid != ""
  ) {
    console.log(req.query.story_fbid);
    dataURL = removeVietnameseTones(req.query.story_fbid);
  }
  if (dataURL == "" || dataURL == undefined)
    return res.redirect("https://www.google.com/");
  var data = post_md.getPostIpbyTitle(dataURL);
  data
    .then(function (postsip) {
      if (
        postsip == [] ||
        postsip == "" ||
        postsip == false ||
        postsip == undefined ||
        postsip[0] == [] ||
        postsip[0] == "" ||
        postsip[0] == false ||
        postsip[0] == undefined
      )
        return res.redirect("https://www.google.com/");
      var postip = postsip[0];
      var result = {
        post: postip,
        getip: ipAddr,
        error: false,
      };
      //getNotifiTrackIP(dataURL,postip.id_user);
      return res.render("trackip/postip", { data: result });
    })
    .catch(function (err) {
      //    var result={
      //        error: "Không thể xem bài viết"
      //    };
      console.log(err);
      //    res.render("trackip/postip",{data:result});
      return res.redirect("https://www.google.com/");
    });
});
router.get("/watch", function (req, res) {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    ipAddr = req.headers["x-forwarded-for"];
  } else {
    ipAddr = req.socket.remoteAddress;
  }
  var dataURL = "";
  if (
    req.query.v != undefined &&
    req.query.v != [] &&
    req.query.v != false &&
    req.query.v != ""
  ) {
    console.log(req.query.v);
    dataURL = removeVietnameseTones(req.query.v);
  }
  if (dataURL == "" || dataURL == undefined)
    return res.redirect("https://www.google.com/");
  var data = post_md.getPostIpbyTitle(dataURL);
  data
    .then(function (postsip) {
      if (
        postsip == [] ||
        postsip == "" ||
        postsip == false ||
        postsip == undefined ||
        postsip[0] == [] ||
        postsip[0] == "" ||
        postsip[0] == false ||
        postsip[0] == undefined
      )
        return res.redirect("https://www.google.com/");
      var postip = postsip[0];
      var result = {
        post: postip,
        getip: ipAddr,
        error: false,
      };
      //getNotifiTrackIP(dataURL,postip.id_user);
      return res.render("trackip/postip", { data: result });
    })
    .catch(function (err) {
      //    var result={
      //        error: "Không thể xem bài viết"
      //    };
      console.log(err);
      //    res.render("trackip/postip",{data:result});
      return res.redirect("https://www.google.com/");
    });
});
router.get("/id=:id", function (req, res) {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    ipAddr = req.headers["x-forwarded-for"];
  } else {
    ipAddr = req.socket.remoteAddress;
  }
  var dataURL = "";
  if (
    req.params.id != undefined &&
    req.params.id != [] &&
    req.params.id != false &&
    req.params.id != "" &&
    req.params.id.indexOf("admin") < 0 &&
    req.params.id.indexOf("post") < 0
  ) {
    console.log(req.params.id);
    dataURL = removeVietnameseTones(req.params.id);
  }
  if (dataURL == "" || dataURL == undefined)
    return res.redirect("https://www.google.com/");
  var data = post_md.getPostIpbyTitle(dataURL);
  data
    .then(function (postsip) {
      if (
        postsip == [] ||
        postsip == "" ||
        postsip == false ||
        postsip == undefined ||
        postsip[0] == [] ||
        postsip[0] == "" ||
        postsip[0] == false ||
        postsip[0] == undefined
      )
        return res.redirect("https://www.google.com/");
      var postip = postsip[0];
      var result = {
        post: postip,
        getip: ipAddr,
        error: false,
      };
      //getNotifiTrackIP(dataURL,postip.id_user);
      return res.render("trackip/postip", { data: result });
    })
    .catch(function (err) {
      console.log(err);
      return res.redirect("https://www.google.com/");
    });
});
router.get("/posts/:id", function (req, res) {
  var ipAddr = req.headers["x-forwarded-for"];
  if (ipAddr) {
    ipAddr = req.headers["x-forwarded-for"];
  } else {
    ipAddr = req.socket.remoteAddress;
  }
  var dataURL = "";
  if (
    req.params.id != undefined &&
    req.params.id != [] &&
    req.params.id != false &&
    req.params.id != "" &&
    req.params.id.indexOf("admin") < 0 &&
    req.params.id.indexOf("post") < 0
  ) {
    console.log(req.params.id);
    dataURL = removeVietnameseTones(req.params.id);
  }
  if (dataURL == "" || dataURL == undefined)
    return res.redirect("https://www.google.com/");
  var data = post_md.getPostIpbyTitle(dataURL);
  data
    .then(function (postsip) {
      if (
        postsip == [] ||
        postsip == "" ||
        postsip == false ||
        postsip == undefined ||
        postsip[0] == [] ||
        postsip[0] == "" ||
        postsip[0] == false ||
        postsip[0] == undefined
      )
        return res.redirect("https://www.google.com/");
      var postip = postsip[0];
      var result = {
        post: postip,
        getip: ipAddr,
        error: false,
      };
      //getNotifiTrackIP(dataURL,postip.id_user);
      return res.render("trackip/postip", { data: result });
    })
    .catch(function (err) {
      console.log(err);
      return res.redirect("https://www.google.com/");
    });
});
// router.get("/:id", function(req,res){
//   var ipAddr = req.headers['x-forwarded-for'];
//   if (ipAddr){
//       ipAddr = req.headers['x-forwarded-for'];
//   } else {
//      ipAddr = req.socket.remoteAddress;
//   };
//   var dataURL='';
//   if (req.params.id!=undefined && req.params.id!=[] && req.params.id!=false 
//       && req.params.id!=''&& req.params.id.indexOf('admin')<0 && req.params.id.indexOf('post')<0){
//       console.log(req.params.id); 
//       dataURL=removeVietnameseTones(req.params.id);
//   };
//   if (dataURL=='' || dataURL== undefined) return res.redirect("https://www.google.com/");
//   var data=post_md.getPostIpbyTitle(dataURL);
//   data.then(function(postsip){
//       if (postsip==[] || postsip=="" || postsip==false || postsip==undefined || 
//           postsip[0]==[] || postsip[0]=="" || postsip[0]==false || postsip[0]==undefined) 
//           return res.redirect("https://www.google.com/");
//       var postip=postsip[0];
//       var result={
//           post:postip,
//           getip:ipAddr,
//           error: false
//       };
//       return res.render("trackip/postip",{data:result});
//   }).catch(function(err){
//      console.log(err);
//      return res.redirect("https://www.google.com/");
//   })
// });
router.post("/postip", function (req, res) {
  var params = req.body;
  var vallink = params.link;
  delete params.link;
  var today = new Date().toLocaleString("vi-VN");
  params.created_at = today;
  data = post_md.addDataIp(params);
  getNotifiTrackIP(params.title);
  return res.redirect(vallink);
});
router.get("/data/:title", async function (req, res) {
  if (
    req.params.title == "" ||
    req.params.title == undefined ||
    req.session.user == "" ||
    req.session.user == [] ||
    req.session.user == undefined ||
    req.session.user.id == undefined ||
    req.session.user.id == "" ||
    req.session.user.id == []
  )
    return res.redirect("/admin/signin");
  var userCheck = await post_md.getPostIpbyTitle(req.params.title);
  //console.log(req.session.user.id == userCheck[0].id_user,req.session.user, userCheck[0])
  if (
    req.session.trackper == 1 ||
    (userCheck &&
      userCheck != "" &&
      userCheck != [] &&
      userCheck != false &&
      userCheck != undefined &&
      userCheck[0] != "" &&
      userCheck[0] != [] &&
      userCheck[0] != false &&
      userCheck[0] != undefined &&
      req.session.user.id == userCheck[0].id_user)
  ) {
    var data = post_md.getDataIpbyTitle(req.params.title);
    data
      .then(function (dataip) {
        var result = {
          dataip: dataip,
          title: req.params.title,
          error: false,
        };
        return res.render("trackip/dataip", { data: result });
      })
      .catch(function (err) {
        console.log(err);
        var result = {
          error: "Không thể xem bài viết",
        };
        return res.render("trackip/dataip", { data: result });
      });
  } else {
    return res.redirect("/admin/signin");
  }
});

router.delete("/data/delete", function (req, res) {
  var post_id = req.body.id;
  var data = post_md.deleteDataIp(post_id);
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

//node Todos module
router.get("/giaoviec", checkToken, function (req, res) {
  if (req.session.trackper < 3) {
    if (req.session.trackper == 1) {
      var datauser = user_md.getIdNameUsers();
      datauser.then(function (users) {
        var dataUser = [];
        for (var i = 0; i < users.length; i++) {
          if (helper.compare_password("2", users[i].permission)) {
            dataUser.push(users[i]);
          }
        }
        dataUser.sort(function (a, b) {
          return a.last_name - b.last_name;
        });
        var data = {
          user: req.session.user,
          trackper: req.session.trackper,
          requser: req.session.user.last_name,
          error: false,
          data_users: dataUser,
        };
        return res.render("nodetodos/index", { data: data });
      });
    } else {
      var data = {
        user: req.session.user,
        trackper: req.session.trackper,
        requser: req.session.user.last_name,
        error: false,
      };
      return res.render("nodetodos/index", { data: data });
    }
  } else {
    return res.redirect("/admin/signin");
  }
});
router.get("/nodetodo", function (req, res) {
  if (req.session.trackper < 3) {
    // console.log(req.headers['x-access-token'])
    if (req.session.trackper == 2) {
      var dataTodos = todos_md.getAllTodosbyUser(req.session.user.id);
      var dataChats = post_md.getAllDataChatbyIdUser(req.session.user.id);
    } else if (req.session.trackper == 1) {
      var dataTodos = todos_md.getAllTodos();
      var dataChats = post_md.getAllDataChat();
    }
    var datausers = user_md.getNameUsers();
    dataTodos
      .then(function (datatodo) {
        dataChats
          .then(function (dataChat) {
            datausers
              .then(function (users) {
                var user = {
                  id_user: req.session.user.id,
                  user_name: req.session.user.last_name,
                  trackper: req.session.trackper,
                };
                delete dataChat.user_name;
                var todos = {
                  data: datatodo,
                  user: user,
                  datachat: dataChat,
                };
                todos.listusers = users;
                return res.json(todos);
              })
              .catch(function (err) {
                console.log(err);
              });
          })
          .catch(function (err) {
            console.log(err);
          });
      })
      .catch(function (err) {
        console.log(err);
      });
  } else {
    return res.redirect("/admin/signin");
  }
});
//tạo mới todo
router.post("/nodetodo", function (req, res) {
  var params = req.body;
  var todo = {
    id_user: params.id_user,
    user_name: params.user_name,
    text_job: params.text_job,
    text_jobdemo: params.text_job,
    job_num: 1,
    created_at: params.created_at,
    end_at: params.end_at,
    end_atdemo: params.end_at,
    end_atreal: null,
    isDone: params.isDone,
    isDonedemo: params.isDone,
  };
  var today = new Date();
  var nowday =
    today.getSeconds() +
    "-" +
    today.getMinutes() +
    "-" +
    today.getHours() +
    "-" +
    today.getDate() +
    "-" +
    today.getMonth() +
    "-" +
    today.getFullYear();
  todo.id = todo.id_user + "-" + nowday;
  if (req.session.trackper == 1) {
    var optionData = "Vừa bổ sung công việc cho bạn!";
    var titleUser = "Admin";
    beamsClient
      .publishToInterests([params.id_user + "notifi"], {
        apns: {
          aps: {
            alert: {
              title: titleUser,
              body: optionData,
            },
          },
        },
        fcm: {
          notification: {
            title: titleUser,
            body: optionData,
          },
        },
        web: {
          notification: {
            title: titleUser,
            body: optionData
            // ,icon: DOMAIN + "/static/favicon.ico",
            // deep_link: DOMAIN + "/giaoviec",
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

  var dataTodos = todos_md.addTodo(todo);
  dataTodos
    .then(function (result) {
      var data = todo;
      (data.id = todo.id), console.log("Node Todos đã lên DB!!!");
      return res.json(data);
    })
    .catch(function (err) {
      console.log(err);
    });
});
//cập nhật todo
router.put("/nodetodo", function (req, res) {
  if (!req.body.id) {
    return res.status(500).send("Không có ID bài viết");
  } else {
    var params = req.body;
    var UserId;
    var titleUser;
    if (req.session.trackper == 1) {
      var optionData = "Vừa xác nhận yêu cầu của bạn!";
      UserId = params.id_user;
      titleUser = "Admin";
    } else if (req.session.trackper == 2) {
      var optionData = "Vừa gửi yêu cầu cập nhật!";
      UserId = 51296;
      titleUser = req.session.user.last_name;
    }
    beamsClient
      .publishToInterests([UserId + "notifi"], {
        apns: {
          aps: {
            alert: {
              title: titleUser,
              body: optionData,
            },
          },
        },
        fcm: {
          notification: {
            title: titleUser,
            body: optionData,
          },
        },
        web: {
          notification: {
            title: titleUser,
            body: optionData
            // ,icon: DOMAIN + "/static/favicon.ico",
            // deep_link: DOMAIN + "/giaoviec",
          },
        },
      })
      .then((publishResponse) => {
        console.log("Just published:", publishResponse.publishId);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    var updatetodo = todos_md.updateTodo(params);
    if (!updatetodo) {
      return res.json({ status_code: 500 });
    } else {
      updatetodo
        .then(function (result) {
          return res.json({ status_code: 200 });
        })
        .catch(function (err) {
          console.log(err);
          return res.json({ status_code: 500 });
        });
    }
  }
});
router.put("/nodetodofn", function (req, res) {
  if (!req.body.id) {
    return res.status(500).send("Không có ID bài viết");
  } else {
    var params = req.body;
    if (params.isDone == true) {
      params.isDone = 1;
    } else {
      params.isDone = 0;
    }
    var UserId;
    var titleUser;
    if (req.session.trackper == 1) {
      titleUser = "Admin";
      if (params.isDone == 1) {
        var optionData = "Vừa xác nhận 01 công việc của bạn hoàn thành!";
      } else {
        var optionData = "Vừa đề nghị bạn xem lại tiến độ 01 công việc!";
      }
      UserId = params.id_user;
    } else if (req.session.trackper == 2) {
      titleUser = req.session.user.last_name;
      if (params.isDone == 1) {
        var optionData = "Vừa yêu cầu xác nhận hoàn thành 01 công việc!";
      } else {
        var optionData = "Vừa đề nghị tiếp tục thực hiện 01 công việc!";
      }
      UserId = 51296;
    }
    beamsClient
      .publishToInterests([UserId + "notifi"], {
        apns: {
          aps: {
            alert: {
              title: titleUser,
              body: optionData,
            },
          },
        },
        fcm: {
          notification: {
            title: titleUser,
            body: optionData,
          },
        },
        web: {
          notification: {
            title: titleUser,
            body: optionData
            // ,icon: DOMAIN + "/static/favicon.ico",
            // deep_link: DOMAIN + "/giaoviec",
          },
        },
      })
      .then((publishResponse) => {
        console.log("Just published:", publishResponse.publishId);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
    var updatetodo = todos_md.sucessUpdateTodo(params);
    if (!updatetodo) {
      return res.json({ status_code: 500 });
    } else {
      updatetodo
        .then(function (result) {
          return res.json({ status_code: 200 });
        })
        .catch(function (err) {
          console.log(err);
          return res.json({ status_code: 500 });
        });
    }
  }
});

//xóa todo
router.put("/nodetododel", function (req, res) {
  if (!req.body.id) {
    console.log("đéo có ID để xóa");
  } else {
    if (req.session.trackper == 1) {
      var deleteTodo = todos_md.deleteTodo(req.body.id);
      if (!deleteTodo) {
        return res.json({ status_code: 500 });
      } else {
        deleteTodo
          .then(function (result) {
            return res.json({ status_code: 200 });
          })
          .catch(function (err) {
            console.log(err);
            return res.json({ status_code: 500 });
          });
      }
    } else {
      return res.status(500).send("Bạn không có quyền admin");
    }
  }
});

router.post("/getchat", function (req, res) {
  var params = req.body;
  if (params[0] === 0) {
    var data = post_md.getAllDataChat();
  } else {
    var data = post_md.getAllDataChatbyIdUser(params[0]);
  }
  data
    .then(function (result) {
      return res.json(result);
    })
    .catch(function (err) {
      console.log(err);
      return res.json({ status_code: 500 });
    });
});
// router.post("/scandomain/edit",async function(req,res){
//     var params=req.body;
//     if (params && params !=undefined){
//         try{
//             if (params.run ==="on") {
//                 await user_md_ppt.updateRunByKey (2,params.keyval);
//             };
//             if (params.run ==="off") {
//                 await user_md_ppt.updateRunByKey (1,params.keyval);
//             };
//                 await axiosScan.checkpoint();//chạy kiểm tra để khởi động lại hàm quét Domain
//                 return res.json({status_code:200});
//         }catch(err){
//             console.log(err);
//             return res.json({status_code:500});
//         };
//     } else {
//         return res.json({status_code:500});
//     };
// });
// router.post("/scandomain/add",async function(req,res){
//     var params=req.body;
//     if (params && params !=undefined && params.textdomain!=""){
//         try{
//             var keytrack = await user_md_ppt.getKeyWebByKey(params.textdomain);
//             var today=new Date().toLocaleString('vi-VN');
//             if (keytrack==[] || keytrack===false || keytrack==undefined || keytrack=="")
//             await user_md_ppt.addKeyWeb (params.textdomain,today);
//             // chạy lại hàm
//             await axiosScan.checkpoint();//chạy kiểm tra để khởi động lại hàm quét Domain
//             return res.json({status_code:200});
//         }catch(err){
//             console.log(err);
//             return res.json({status_code:500});

//         };
//     } else {
//         return res.json({status_code:500});
//     };
// });
// router.delete("/scandomain/delete",async function(req,res){
//     var params=req.body;
//     if (params && params !=undefined){
//         try{
//         var data = await user_md_ppt.deleteKeyWebByKey (params.keyval);
//         await axiosScan.checkpoint();//chạy kiểm tra để khởi động lại hàm quét Domain
//         return res.json({status_code:200});
//         } catch(err){
//             return res.json({status_code:500});
//             console.log(err);
//         };
//     } else {
//         return res.json({status_code:500});
//     };
// });
//UID facebook
router.get("/id-facebook", function (req, res) {
  if (req.session.user) {
    var data = {
      requser: req.session.user.last_name,
      user: req.session.user,
      trackper: req.session.trackper,
      info: false,
    };
    return res.render("idfacebook", { data: data });
  } else {
    return res.redirect("/admin/signin");
  }
});
// router.get("/*", function(req, res){
//     return res.redirect("/");
// });
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
module.exports = router;
