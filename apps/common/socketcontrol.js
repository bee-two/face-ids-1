//const { async } = require("q");

module.exports = function (io) {
  var idConect = [];
  var idConect_str = [];
  // var idAdmin=[];
  io.sockets.on("connect", function (socket) {
    // console.log("Có một User mới kết nối");
    //listen adduser event
    socket.on("adduser", function (user_name, id_user, trackper) {
      socket.user_name = user_name;
      socket.id_user = id_user;
      socket.trackper = trackper;
      // idConect.push(id_user);
      console.log("Username vừa kết nối SocketIO: " + user_name);
      if (socket.trackper == 1) {
        socket.join(51296);
        idConect["51296"] = id_user; //xác định onl, off
      } else {
        socket.join(id_user);
        idConect[id_user + ""] = id_user; //xác định onl, off
      }
    });
    //listen disconnect event
    socket.on("disconnect", function () {
      for (var i = 0; i < idConect.length; i++) {
        if (idConect[i] == socket.id_user) {
          idConect.splice(i, 1);
          break;
        }
      }
    });
    //listen send_message event
    socket.on("send_message", function (message) {
      //notify to myself
      socket.emit("update_message", message);
      //notify other user
      if (message.re_user !== 0) {
        if (message.trackper == 1) {
          socket.to(message.re_user).emit("update_message", message);
        } else {
          socket.to(51296).emit("update_message", message);
        }
      } else {
        socket.broadcast.emit("update_message", message);
      }
      var post_md = require("../models/post");
      if (message.trackper == 1) {
        if (
          idConect[message.re_user + ""] &&
          idConect[message.re_user + ""] == message.re_user
        ) {
          message.online = 1;
        } else {
          message.online = 0;
        }
      } else {
        if (
          idConect["51296"] &&
          idConect["51296"] != undefined &&
          idConect["51296"] != null
        ) {
          message.online = 1;
        } else {
          message.online = 0;
        }
      }
      //}
      var messageDB = message;
      // delete messageDB.user_name;
      let addChat = post_md.addDataChat(messageDB);
    });
    //add function
    var funcUser_ppt = require("../models/user_ppt");
    var funcJob_ppt = require("../models/asyncfunction");
    var number_change_facebook = 0; //đếm số lần biến đổi khi sử dụng tài khoản facebook,
    var check_stop = false; //kiểm tra dữ liệu để ngừng hàm bất chợt
    async function resetCookies(check) {
      if (number_change_facebook > 30) {
        await funcJob_ppt.deleteCookiesInPPT();
        number_change_facebook = 0;
        if (check !== true) await Login_facebook(true, "", "");
      }
    }
    async function updateArrayClient(arr) {
      var dataIndex = listjobFBInformation("index");
      var ArrayJob = [];
      ArrayJob.push(...arr);
      var arrReturn = [];
      if (
        ArrayJob == undefined ||
        ArrayJob == [] ||
        ArrayJob == false ||
        ArrayJob == "" ||
        ArrayJob == null
      ) {
        arrReturn.push([0, 0]);
      } else {
        // var ArrayJob0=[]; var numb0=0;
        // for (var j=0;j<ArrayJob;j++) {
        //     if(ArrayJob[j][1])
        //     ArrayJob0[numb0]= new Array(...ArrayJob0[numb0],ArrayJob[j][0])
        // };
        for (var i = 0; i < ArrayJob.length; i++) {
          if (i > 3) break;
          if (i === 0 && (ArrayJob[0][0] == 0 || ArrayJob[0] == 0)) {
            arrReturn.push([0, 0]);
          } else {
            arrReturn.push(ArrayJob[i]);
          }
          if (ArrayJob.length <= i + 1) break;
          // lấy tất cả khả năng arr trước
          //var dataArrSum0=[];
          if (
            i > 0 &&
            dataIndex[ArrayJob[i][0]].indexOf(ArrayJob[i + 1][0]) < 0 &&
            ArrayJob[i][1] != ArrayJob[i + 1][1]
          )
            break;
          //if (i+1<ArrayJob.length) arrReturn.push(ArrayJob[i+1])
          //if (i>0 && dataIndex[ArrayJob[i]].indexOf(ArrayJob[i+1])>=0) arrReturn.push(ArrayJob[i+1]);
        }
      }
      return arrReturn;
    }
    //Danh sách các hàm và chú thích hàm số tại server
    function listjobFBInformation(data, job) {
      var data_name_job = [
        "getfacebookUID",
        "getFriendsFb",
        "getfollowingFb",
        "getPagesFbUID",
        "getContentSTTFbUID",
        "getMembersGroup",
        "getGroupsOfPages",
        "getLinkVideoFB",
        "UIDsigninGroups",
        "fillContentSTTbyKeys",
        "searchPagesOrgroups",
        "searchSTTContents",
        "getContentsLikeCmtShare",
        "searchSTTContentsinUID",
        "addFbProblem",
        "getSubGroupsOGroups",
      ];
      var data_job = {
        getfacebookUID: "UID tài khoản (return UID)",
        getFriendsFb: "Bạn bè (return UID)",
        getfollowingFb: "Đang theo dõi (bạn, trang...=> return UID)",
        getPagesFbUID: "Các Trang (page) đang thích (return UID)",
        getContentSTTFbUID: "Bài viết gần đây trên Story (return text, UID)",
        getMembersGroup: "Thành viên Nhóm (return UID)",
        getGroupsOfPages: "Nhóm có liên kết với Trang (return UID)",
        getLinkVideoFB: "Link tải video (Link/file)",
        UIDsigninGroups: "UID có tham gia Groups-Danger (true/false)",
        fillContentSTTbyKeys:
          'Lọc nội dung bài viết qua "Key-FB-Danger" (true/false)',
        searchPagesOrgroups:
          "Tìm kiếm Trang/Nhóm theo từ khóa (return link, text)",
        searchSTTContents:
          "Tìm kiếm bài viết theo từ khóa FB-Danger (return link, text)",
        getContentsLikeCmtShare: "Lấy người Like, Cmt, Share (return UID)",
        searchSTTContentsinUID:
          "Tìm kiếm bài viết chứa từ khóa FB-Danger trong UID (return UID, text)",
        addFbProblem: "Thêm Facebook vào danh sách quét thường xuyên",
        getSubGroupsOGroups: "Nhóm nhỏ trong Nhóm (return UID, text)",
      };
      if (data === "index") {
        var data_name_job_IndexAfder = new Array();
        data_name_job_IndexAfder[0] = new Array(1, 2, 4, 5, 6, 8, 13, 15); //3
        data_name_job_IndexAfder[1] = new Array(1, 2, 4, 8); //0,3
        data_name_job_IndexAfder[2] = new Array(1, 2, 4, 5, 6, 8, 15); //0,3
        data_name_job_IndexAfder[3] = new Array(4, 6, 15);
        data_name_job_IndexAfder[4] = new Array(9, 12);
        data_name_job_IndexAfder[5] = new Array(1, 2, 4, 5, 6, 8, 15); //0,3
        data_name_job_IndexAfder[6] = new Array(9, 4, 5, 8, 12, 13); //0
        data_name_job_IndexAfder[7] = new Array();
        data_name_job_IndexAfder[8] = new Array();
        data_name_job_IndexAfder[9] = new Array();
        data_name_job_IndexAfder[10] = new Array(9, 4, 6, 8, 12, 13, 15); //0
        data_name_job_IndexAfder[11] = new Array(9);
        data_name_job_IndexAfder[12] = new Array(13, 4); //0
        data_name_job_IndexAfder[13] = new Array(9);
        data_name_job_IndexAfder[14] = new Array();
        data_name_job_IndexAfder[15] = new Array(9, 4, 5, 8, 12, 13); //0
        return data_name_job_IndexAfder;
      }
      if (data === 1) {
        return data_job;
      }
      if (data === 2) {
        return data_name_job;
      }
      if (
        data == 3 &&
        data > 2 &&
        job !== "" &&
        job !== null &&
        job !== undefined
      ) {
        var numjob = data_name_job[job];
        if (numjob && numjob != undefined) return numjob;
        return false;
      }
      if (data === "start") {
        var arrDataNotUID = [1, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15]; //3
        return arrDataNotUID;
      }
      return false;
    }
    //login puppeteer
    async function Login_puppeteer() {
      const lauch = await funcJob_ppt.launchPuppeteer();
      //console.log('lauch: '+lauch);
      if (lauch == false) {
        let valmess1 = {
          data: "<li>- Lauch Puppeteer failed!</li><li><b>Done!</b></li>",
          checkbtn: false,
        };
        await socket.emit("update_message_str", valmess1);
        return false;
      }
      console.log("function launchPuppeteer() success");
      let valmess2 = {
        data: "<li>- Lauch Puppeteer Success!</li>",
        checkbtn: true,
      };
      await socket.emit("update_message_str", valmess2);
      return true;
    }
    async function Login_facebook(success, email, pass) {
      //Login User!
      if (success === false) {
        let valmess = {
          data: "<li>- Add Accout FB err!</li><li><b>Done!</b></li>",
          checkbtn: false,
        };
        await socket.emit("update_message_str", valmess);
        console.log("add Accout FB err!");
        return false;
      }
      var login = [];
      if (
        email !== "" &&
        pass !== "" &&
        email != undefined &&
        pass != undefined
      ) {
        var user = {
          user_name: email,
          password: pass,
        };
        var checkaccount = await funcUser_ppt.getAcoutFbbyEmail(email);
        if (
          checkaccount[0] == undefined ||
          checkaccount[0] == null ||
          checkaccount[0] == [] ||
          checkaccount[0] == "" ||
          checkaccount[0] == false
        ) {
          try {
            let addFB = await funcUser_ppt.addAcoutFb(user);
            if (addFB !== false) await listfb(); //thay doi list account fb
            console.log("addAcoutFb: ", email);
            let valmess3 = {
              data: "<li>- Add a Accout FB to Server!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess3);
          } catch (err) {
            console.log(err);
            await listfb(); //thay doi list account fb
            let valmess4 = {
              data:
                "<li>- Add Accout FB err!</li><li>- " +
                err +
                "</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess4);
            console.log("add Accout FB err!");
            return false;
          }
        }
      }
      var usernotCookie = await funcUser_ppt.getFBnotCookie();
      console.log("usernotCookie: " + usernotCookie[0]);
      if (
        usernotCookie[0] !== undefined &&
        usernotCookie.length > 0 &&
        usernotCookie != false
      ) {
        console.log("start loginfacebookwithUser");
        login = await funcJob_ppt.loginfacebookwithUser(
          usernotCookie[0].user_name,
          usernotCookie[0].password
        );
        //console.log("loginfacebookwithUser: "+ login);
      } else {
        do {
          login = await funcJob_ppt.loginwebFBwithCookie();
          console.log("login: ", login);
        } while (login === 2);
      }
      //if ((login===false || login===[]) && (userfb && passfb)) login = await async_ppt.loginfacebookwithUser(userfb,passfb);
      if (login === false || login === []) {
        await listfb(); //thay doi list account fb
        let valmess5 = {
          data: "<li>- Login Facebook failed!</li><li><b>Done!</b></li>",
          checkbtn: false,
        };
        await socket.emit("update_message_str", valmess5);
        console.log("Login Facebook failed!");
        return await funcJob_ppt.closePuppeteer();
      }
      let valmess6 = {
        data: "<li>- Login Facebook Success!</li>",
        checkbtn: true,
      };
      await socket.emit("update_message_str", valmess6);
      console.log("Login Facebook Success!");
      number_change_facebook = 0;
    }
    //get video function
    async function getLinkVideoFB(textlink) {
      try {
        if (
          textlink != undefined &&
          textlink.length > 0 &&
          textlink != false &&
          textlink != ""
        ) {
          var valtext;
          if (typeof textlink == "object" && typeof textlink[0] == "object") {
            if (
              textlink[0][0].indexOf("https://") < 0 &&
              textlink[0][0].indexOf(".com") < 0
            ) {
              valtext = "https://www.facebook.com/" + textlink[0][0];
            } else {
              valtext = textlink[0][0];
            }
          } else if (
            typeof textlink == "object" &&
            typeof textlink[0] == "string"
          ) {
            if (
              textlink[0].indexOf("https://") < 0 &&
              textlink[0].indexOf(".com") < 0
            ) {
              valtext = "https://www.facebook.com/" + textlink[0];
            } else {
              valtext = textlink[0];
            }
          } else {
            if (
              textlink.indexOf("https://") < 0 &&
              textlink.indexOf(".com") < 0
            ) {
              valtext = "https://www.facebook.com/" + textlink;
            } else {
              valtext = textlink;
            }
          }
          var valLink = await funcJob_ppt.getLinkVideoFB(valtext);
          number_change_facebook++;
          await resetCookies();
          console.log("valLink: " + valLink);
          if (valLink == false) {
            let valmess7 = {
              data: "<li>- Không tìm thấy Link tải Video.</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess7);
          } else {
            let valmess8 = {
              data:
                '<li>- <a target="_blank" href="' +
                valLink +
                '"> Video: ' +
                valtext +
                ' (Tại đây <i class="fa fa-download"></i>)!</a></li>',
              checkbtn: true,
            };
            // let valmess9={
            //     data: '<li>' + valLink + '</li>',
            //     checkbtn: true
            // };
            await socket.emit("update_message_str", valmess8);
            return valLink;
          }
        }
      } catch (err) {
        console.log(err);
        let valmess7 = {
          data:
            "<li>- Lỗi lấy Link tải Video.</li><li>- " +
            err +
            "</li><li><b>Done!</b></li>",
          checkbtn: true,
        };
        await socket.emit("update_message_str", valmess7);
      }
    }
    //get UID facebook
    async function getfacebookUID(textlink, type) {
      if (
        textlink != undefined &&
        textlink.length > 0 &&
        textlink != "" &&
        textlink != false
      ) {
        try {
          if (
            textlink != undefined &&
            textlink != "" &&
            typeof textlink == "object" &&
            typeof textlink[0] == "object"
          ) {
            var UID = [];
            for (var i = 0; i < textlink.length; i++) {
              var UID0 = await funcJob_ppt.getfacebookUID(textlink[i][0], type);
              number_change_facebook++;
              if (
                UID0 == "" ||
                UID0 == [] ||
                UID0 == false ||
                UID0 == undefined
              ) {
                let valmess9 = {
                  data:
                    "<li>- Không tìm thấy UID trong Link (obj): " +
                    textlink[i][0] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess9);
                return [];
                //if (i==textlink.length-1) return ;
              } else {
                UID.push(UID0[0]);
              }
              //console.log('valLink: ' + UID);
              if (type === true) {
                var typeUID = UID0[0][0] + " (Type: " + UID0[0][1] + ")";
              } else {
                var typeUID = UID0[0][0];
              }
              let valmess = {
                data:
                  "<li>- Link: " +
                  textlink[i][0] +
                  " ===> Converted to UID: " +
                  typeUID +
                  "</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
            return UID;
          } else if (
            textlink != undefined &&
            textlink != "" &&
            typeof textlink == "object" &&
            typeof textlink[0] == "string"
          ) {
            var UID = [];
            for (var i = 0; i < textlink.length; i++) {
              var UID0 = await funcJob_ppt.getfacebookUID(textlink[i], type);
              number_change_facebook++;
              if (
                UID0 == "" ||
                UID0 == [] ||
                UID0 == false ||
                UID0 == undefined
              ) {
                let valmess9 = {
                  data:
                    "<li>- Không tìm thấy UID trong Link (string[0]): " +
                    textlink[i] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess9);
                //if (i==textlink.length-1) return ;
              } else {
                UID.push(UID0[0]);
              }
              if (type === true) {
                var typeUID = UID0[0][0] + " (Type: " + UID0[0][1] + ")";
              } else {
                var typeUID = UID0[0][0];
              }
              let valmess = {
                data:
                  "<li>- Link: " +
                  textlink[i] +
                  " ===> Converted to UID: " +
                  typeUID +
                  "</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
            return UID;
          } else if (
            textlink != undefined &&
            textlink != "" &&
            typeof textlink == "string"
          ) {
            var UID = await funcJob_ppt.getfacebookUID(textlink, type);
            number_change_facebook++;
            if (UID == "" || UID == [] || UID == false || UID == undefined) {
              let valmess9 = {
                data:
                  "<li>- Không tìm thấy UID trong Link (string): " +
                  textlink +
                  "</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess9);
              return;
            }
            if (type === true) {
              var typeUID = UID[0][0] + " (Type: " + UID[0][1] + ")";
            } else {
              var typeUID = UID[0][0];
            }
            let valmess = {
              data:
                "<li>- " +
                textlink +
                " ===> Converted to UID: " +
                typeUID +
                "</li>",
              checkbtn: true,
            };
            console.log("getfacebookUID is: " + UID);
            await socket.emit("update_message_str", valmess);
            return UID;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //get UID facebook
    async function getFriendsFb(listUID) {
      if (
        listUID != undefined &&
        listUID != "" &&
        listUID != [] &&
        listUID != false
      ) {
        try {
          var list_friend = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          // console.log(typeof (getUIDList0[0]),typeof (getUIDList0),getUIDList0[0],getUIDList0[0][1])
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "userID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "" || getUIDList == false) {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Tài khoản cá nhân</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getFriendsFb(getUIDList[i]);
            console.log("get Friend: " + getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_friend[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess9 = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> friend)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess9);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (list_friend == [] || list_friend == "" || list_friend == false) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_friend;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getfollowingFb
    async function getfollowingFb(listUID) {
      if (
        listUID != undefined &&
        listUID != "" &&
        listUID != [] &&
        listUID != false
      ) {
        try {
          var list_followingFb = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "userID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "") {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Tài khoản cá nhân</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getfollowingFb(getUIDList[i]);
            console.log("get follow: " + getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_followingFb[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> following)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;

            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_followingFb == [] ||
            list_followingFb == "" ||
            list_followingFb == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_followingFb;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getPagesFbUID
    async function getPagesFbUID(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_PageOfFb = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "userID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "" || getUIDList == false) {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Tài khoản cá nhân</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getPagesFbUID(getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_PageOfFb[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> Page)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_PageOfFb == [] ||
            list_PageOfFb == "" ||
            list_PageOfFb == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_PageOfFb;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getContentSTTFbUID
    async function getContentSTTFbUID(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_SttOfFb = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID);
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object"
          ) {
            var getUIDList = [];
            for (var i = 0; i < getUIDList0.length; i++) {
              getUIDList[i] = getUIDList0[i][0];
              getUIDList0[i] = [];
            }
            getUIDList0 = [];
          }
          if (
            getUIDList == [] ||
            getUIDList == false ||
            getUIDList == undefined ||
            getUIDList == ""
          ) {
            let valmess = {
              data: "<li>- Không tìm thấy UID</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getContentSTTFbUID(getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_SttOfFb[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> Status)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_SttOfFb == [] ||
            list_SttOfFb == "" ||
            list_SttOfFb == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_SttOfFb;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getMembersGroup
    async function getMembersGroup(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_MembersOfGr = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "groupID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "" || getUIDList == false) {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Nhóm</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getMembersGroup(getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_MembersOfGr[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> Members)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_MembersOfGr == [] ||
            list_MembersOfGr == "" ||
            list_MembersOfGr == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_MembersOfGr;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getGroupsOfPages
    async function getGroupsOfPages(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_GroupOfPage = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "pageID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "" || getUIDList == false) {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Trang</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getGroupsOfPages(getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_GroupOfPage[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> Group)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_GroupOfPage == [] ||
            list_GroupOfPage == "" ||
            list_GroupOfPage == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_GroupOfPage;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getSubGroupsOGroups
    async function getSubGroupsOGroups(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_GroupOfPage = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "groupID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "" || getUIDList == false) {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Nhóm</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.getSubGroupsOGroups(getUIDList[i]);
            if (
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null &&
              data != false
            ) {
              for (var l = 0; l < data.length; l++) {
                list_GroupOfPage[numbarr1] = new Array(...data[l]);
                numbarr1++;
              }
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (get <b>" +
                  data.length +
                  "</b> Group)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
            } else {
              let valmess1 = {
                data:
                  "<li>- Không tìm thấy dữ liệu trong: " +
                  getUIDList[i] +
                  "</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_GroupOfPage == [] ||
            list_GroupOfPage == "" ||
            list_GroupOfPage == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_GroupOfPage;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //UIDsigninGroups
    async function UIDsigninGroups(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_UIDSignGroup = new Array();
          var numbarr1 = 0;
          var getUIDList0 = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList0 != undefined &&
            getUIDList0 !== false &&
            getUIDList0 != "" &&
            typeof getUIDList0 == "object" &&
            typeof getUIDList0[0] == "object"
          ) {
            var getUIDList = [];
            var numbarr = 0;
            for (var i = 0; i < getUIDList0.length; i++) {
              if (getUIDList0[i][1] == "userID") {
                getUIDList[numbarr] = getUIDList0[i][0];
                getUIDList0[i] = [];
                numbarr++;
              }
            }
            getUIDList0 = [];
          }
          if (getUIDList == [] || getUIDList == "" || getUIDList == false) {
            let valmess = {
              data: "<li>- Không tìm thấy UID là Trang</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
          for (var i = 0; i < getUIDList.length; i++) {
            var data = await funcJob_ppt.UIDsigninGroups(getUIDList[i]);
            if (
              data != false &&
              data != [] &&
              data != "" &&
              data != undefined &&
              data != null
            ) {
              //for (var l=0;l<data.length;l++){
              list_UIDSignGroup[numbarr1] = new Array(getUIDList[i]);
              numbarr1++;
              //};
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (Signed <b>" +
                  data.length +
                  "</b> Group Danger)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              await creatFileCSV(getUIDList[i], data);
              // Thêm vào DB ID có alert
              //var UID = await funcJob_ppt.getfacebookUID(listUID[i][0],true);
              var trackProb = await funcUser_ppt.getFBProbByUID(getUIDList[i]);
              var date = new Date();
              var adddate =
                date.getFullYear() +
                "-" +
                (date.getMonth() + 1) +
                "-" +
                date.getDate();
              if (
                trackProb != [] &&
                trackProb != undefined &&
                trackProb != false &&
                trackProb != ""
              ) {
                //update lever
                await funcUser_ppt.updateLeverProbByUID(
                  getUIDList[i],
                  trackProb[0].lever + 1,
                  adddate
                );
                await funcUser_ppt.updateProbByUID(getUIDList[i], 1, adddate);
              } else {
                // Thêm mới dữ liệu
                //var date = new Date();
                var data = {
                  id_fb: getUIDList[i],
                  type_fb: "userID",
                  number_track: 0,
                  problem: 1,
                  lever: 0,
                  created: adddate,
                };
                await funcUser_ppt.addFbProblem(data);
              }
              let valmess11 = {
                data:
                  '<li>- <a href="https://www.facebook.com/' +
                  getUIDList[i] +
                  '">UID: ' +
                  getUIDList[i] +
                  '</a> Tham gia <b style="color: brown;">Group-Danger (Lever 0)</b></li>',
                checkbtn: true,
              };
              await addAccountFBdangerForClient();
              await socket.emit("update_message_str", valmess11);
            } else {
              let valmess = {
                data:
                  "<li>- UID: " +
                  getUIDList[i] +
                  " (Not Signed Group Danger)</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess);
              // let valmess1={
              //     data: '<li>- Không tìm thấy dữ liệu trong: '+ getUIDList[i] + '</li>',
              //     checkbtn: false
              // };
              // await socket.emit("update_message_str",valmess1);
            }
            number_change_facebook++;
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          getUIDList = [];
          if (
            list_UIDSignGroup == [] ||
            list_UIDSignGroup == "" ||
            list_UIDSignGroup == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_UIDSignGroup;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //fillContentSTTbyKeys
    async function fillContentSTTbyKeys(listUID) {
      if (listUID) {
        try {
          var list_STTDanger = new Array();
          var numb = 0;
          if (
            listUID == undefined ||
            listUID == [] ||
            listUID == null ||
            listUID == "" ||
            listUID == false
          ) {
            let valmess9 = {
              data: "<li>- UID trống</li><li><b>Done!</b></li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess9);
            return false;
          }

          if (
            listUID == false ||
            listUID == undefined ||
            listUID == [] ||
            listUID == ""
          ) {
            let valmess9 = {
              data: "<li>- Lỗi UID</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess9);
            return false;
          }
          if (typeof listUID == "string") {
            let listUID0 = listUID;
            listUID = [];
            listUID[0] = ["", listUID0];
            listUID0 = [];
          }
          var AllSTTProb = await funcUser_ppt.getAllSTTProb();
          var AllFBProb = await funcUser_ppt.getAllFBProb();
          var Keys = await funcUser_ppt.getAllKeyFb();
          for (var i = 0; i < listUID.length; i++) {
            let track = await funcJob_ppt.fillContentSTTbyKeys(
              listUID[i][1],
              Keys
            );
            if (track !== false) {
              var STTProb = false;
              for (let STTProbs of AllSTTProb) {
                if (STTProbs.link_stt == listUID[i][0]) {
                  STTProb = true;
                  break;
                }
              }
              if (STTProb == false) {
                // Thêm vào DB ID có alert
                var UID = await funcJob_ppt.getUIDBylinkSTT(
                  listUID[i][0],
                  true
                );
                //var trackProb = await funcUser_ppt.getFBProbByUID(UID[0]);
                if (
                  UID == [] ||
                  UID == "" ||
                  UID == undefined ||
                  typeof UID != "object"
                ) {
                  //console.log('không tìm thấy UID từ: ', listUID[i][0],', UID is: ', UID);
                  let valmess = {
                    data:
                      "<li>- không tìm thấy UID từ: " + listUID[i][0] + "</li>",
                    checkbtn: true,
                  };
                  await socket.emit("update_message_str", valmess);
                } else {
                  // nếu chưa tồn tại thì thêm mới vào Danh sách
                  let SttDB = {
                    link_stt: listUID[i][0],
                    id_fb: UID[0][0],
                    number_track: 0,
                    check_info: 0,
                    key_train: track,
                  };
                  await funcUser_ppt.addFbStt(SttDB);
                  let valmessa = {
                    data:
                      "<li>- Đã thêm mới STT Danger: " +
                      listUID[i][0] +
                      "</li>",
                    checkbtn: true,
                  };
                  await socket.emit("update_message_str", valmessa);
                  var trackProb = false;
                  for (let FBProb of AllFBProb) {
                    if (FBProb.id_fb == UID[0][0]) {
                      trackProb = FBProb.lever;
                      break;
                    }
                  }
                  var date = new Date();
                  var adddate =
                    date.getFullYear() +
                    "-" +
                    (date.getMonth() + 1) +
                    "-" +
                    date.getDate();
                  if (
                    trackProb != false &&
                    trackProb != "" &&
                    trackProb != undefined
                  ) {
                    //update lever
                    await funcUser_ppt.updateLeverAndProbByUID(
                      UID[0][0],
                      trackProb.lever + 1,
                      1,
                      adddate
                    );
                    //await funcUser_ppt.updateProbByUID(UID[0], 1, adddate);
                  } else {
                    // Thêm mới dữ liệu
                    //var date = new Date();
                    var data = {
                      id_fb: UID[0][0],
                      type_fb: UID[0][1],
                      number_track: 0,
                      problem: 1,
                      lever: 1,
                      created: adddate,
                    };
                    await funcUser_ppt.addFbProblem(data);
                  }
                  let valmessb = {
                    data:
                      '<li>- <a href="' +
                      listUID[i][0] +
                      '">Link: ' +
                      listUID[i][0] +
                      '</a> chứa từ khóa <b style="color: brown;">Fb-Danger (Lever 1): ' +
                      track +
                      "</b></li>",
                    checkbtn: true,
                  };
                  await addAccountFBdangerForClient();
                  await socket.emit("update_message_str", valmessb);
                  list_STTDanger[numb] = new Array(listUID[i]);
                  numb++;
                }
              } else {
                let valmess = {
                  data:
                    "<li>- STT Danger đã tồn tại: " + listUID[i][0] + "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess);
              }
            } else {
              let valmess1 = {
                data:
                  "<li>- Link: " +
                  listUID[i][0] +
                  " không chứa từ khóa Fb-Danger</li>",
                checkbtn: false,
              };
              await socket.emit("update_message_str", valmess1);
              //return false;
            }
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          if (
            list_STTDanger == [] ||
            list_STTDanger == "" ||
            list_STTDanger == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_STTDanger;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //searchPagesOrgroups
    async function searchPagesOrgroups(listUID) {
      //console.log('Key of searchPagesOrgroups: ' + listUID);
      if (listUID) {
        try {
          var list_PageOrGroup = new Array();
          if (
            listUID == undefined ||
            listUID == [] ||
            listUID == null ||
            listUID == false ||
            listUID == ""
          ) {
            let valmess9 = {
              data: "<li>- Không có dữ liệu để tìm kiếm</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess9);
            return false;
          }
          var track = new Array();
          console.log(
            "list UID: " +
              listUID +
              " " +
              typeof listUID +
              " " +
              typeof listUID[0]
          );
          if (typeof listUID == "object" && typeof listUID[0] == "object") {
            console.log("listUID[0][0]: " + listUID[0][0]);
            for (var i = 0; i < listUID.length; i++) {
              track[i] = new Array(
                ...(await funcJob_ppt.searchPagesOrgroups(listUID[i][0]))
              );
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
          } else if (
            typeof listUID == "object" &&
            typeof listUID[0] == "string"
          ) {
            console.log("listUID[0]: " + listUID[0]);
            for (var i = 0; i < listUID.length; i++) {
              track[i] = new Array(
                ...(await funcJob_ppt.searchPagesOrgroups(listUID[i]))
              );
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
          } else if (typeof listUID == "string") {
            console.log("listUID: " + listUID);
            track[0] = new Array(
              ...(await funcJob_ppt.searchPagesOrgroups(listUID))
            );
          }
          //console.log('list group: '+ track);
          var numb = 0;
          if (
            track == [] ||
            track == false ||
            track == undefined ||
            track == ""
          ) {
            let valmess1 = {
              data:
                "<li>- Không tìm thấy trang, nhóm có từ khóa: " +
                listUID +
                "</li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess1);
            return false;
          }
          for (var i = 0; i < track.length; i++) {
            let valmess = {
              data:
                "<li>- Tìm thấy: <b>" +
                track[i].length +
                '</b> Trang và Nhóm chứa từ khóa "<b>' +
                listUID +
                '</b>"</li>',
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess);
            for (var j = 0; j < track[i].length; j++) {
              list_PageOrGroup[numb] = new Array(...track[i][j]);
              numb++;
            }
            track[i] = [];
            await creatFileCSV(listUID, list_PageOrGroup);
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          track = [];
          if (
            list_PageOrGroup == [] ||
            list_PageOrGroup == "" ||
            list_PageOrGroup == false
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_PageOrGroup;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      } else {
        let valmess9 = {
          data: "<li>- Lỗi UID</li><li><b>Done!</b></li>",
          checkbtn: false,
        };
        await socket.emit("update_message_str", valmess9);
        return false;
      }
    }
    //searchSTTContents:searchSTTContents,
    async function searchSTTContents(listUID) {
      if (listUID) {
        try {
          var list_STT = new Array();
          var track = [];
          if (
            listUID == undefined ||
            listUID == [] ||
            listUID == null ||
            listUID == false ||
            listUID == ""
          ) {
            let valmess9 = {
              data: "<li>- Không có dữ liệu để tìm kiếm</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess9);
            return false;
          }
          if (typeof listUID == "object" && typeof listUID[0] == "object") {
            for (var i = 0; i < listUID.length; i++) {
              track[i] = new Array(
                ...(await funcJob_ppt.searchSTTContents(listUID[i][0]))
              );
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
          } else if (
            typeof listUID == "object" &&
            typeof listUID[0] == "string"
          ) {
            for (var i = 0; i < listUID.length; i++) {
              track[i] = new Array(
                ...(await funcJob_ppt.searchSTTContents(listUID[i]))
              );
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
          } else if (typeof listUID == "string") {
            track[0] = new Array(
              ...(await funcJob_ppt.searchSTTContents(listUID))
            );
          }
          var numb = 0;
          if (
            track == [] ||
            track == false ||
            track == undefined ||
            track == ""
          ) {
            let valmess1 = {
              data:
                "<li>- Không tìm thấy bài viết có từ khóa: " +
                listUID +
                "</li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess1);
            return false;
          }
          for (var i = 0; i < track.length; i++) {
            let valmess = {
              data:
                '<li>- <a href="' +
                track[i][0] +
                '">' +
                track[i][1] +
                "</a></li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess);
            for (var j = 0; j < track[i].length; j++) {
              list_STT[numb] = new Array(...track[i][j]);
              numb++;
            }
            track[i] = [];

            await creatFileCSV(track[i], track[i]);
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          track = [];
          return list_STT;
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //getContentsLikeCmtShare:getContentsLikeCmtShare,
    async function getContentsLikeCmtShare(listUID) {
      if (listUID) {
        try {
          var output = new Array();
          var numb = 0;
          if (
            listUID == undefined ||
            listUID == [] ||
            listUID == null ||
            listUID == "" ||
            listUID == false
          ) {
            let valmess9 = {
              data: "<li>- Không có dữ liệu để tìm kiếm</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess9);
            return false;
          }
          if (typeof listUID == "object" && typeof listUID[0] == "object") {
            for (var i = 0; i < listUID.length; i++) {
              var track1 = await funcJob_ppt.getContentsCmtShare(listUID[i][0]);
              if (
                track1 !== [] &&
                track1 !== false &&
                track1 !== undefined &&
                track1 != ""
              ) {
                for (var j = 0; j < track1.length; j++) {
                  output[numb] = new Array(...track1[j]);
                  numb++;
                }
                await creatFileCSV(listUID[i], track1);
              } else {
                let valmess1 = {
                  data:
                    '<li>- Không tìm thấy tương tác "Comment, Share" từ Link (object1): ' +
                    listUID[i][0] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess1);
              }
              var track2 = await funcJob_ppt.getContentsLike(listUID[i][0]);
              if (
                track2 !== [] &&
                track2 !== false &&
                track2 !== undefined &&
                track2 != ""
              ) {
                for (var j = 0; j < track2.length; j++) {
                  output[numb] = new Array(...track2[j]);
                  numb++;
                }
                await creatFileCSV(listUID[i], track2);
              } else {
                let valmess2 = {
                  data:
                    '<li>- Không tìm thấy tương tác "Like" từ Link (object2): ' +
                    listUID[i][0] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess2);
              }
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
          } else if (
            typeof listUID == "object" &&
            typeof listUID[0] == "string"
          ) {
            for (var i = 0; i < listUID.length; i++) {
              var track1 = await funcJob_ppt.getContentsCmtShare(listUID[i]);
              if (
                track1 !== [] &&
                track1 !== false &&
                track1 !== undefined &&
                track1 != ""
              ) {
                for (var j = 0; j < track1.length; j++) {
                  output[numb] = new Array(...track1[j]);
                  numb++;
                }
                await creatFileCSV(listUID[i], track1);
              } else {
                let valmess1 = {
                  data:
                    '<li>- Không tìm thấy tương tác "Comment, Share" từ Link (object3): ' +
                    listUID[i] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess1);
              }
              var track2 = await funcJob_ppt.getContentsLike(listUID[i]);
              if (
                track2 !== [] &&
                track2 !== false &&
                track2 !== undefined &&
                track2 != ""
              ) {
                for (var j = 0; j < track2.length; j++) {
                  output[numb] = new Array(...track2[j]);
                  numb++;
                }
                await creatFileCSV(listUID[i], track2);
              } else {
                let valmess2 = {
                  data:
                    '<li>- Không tìm thấy tương tác "Like" từ Link (object4): ' +
                    listUID[i] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess2);
              }
              if (check_stop == true) {
                check_stop = false;
                break;
              }
            }
          } else if (typeof listUID == "string") {
            var track1 = await funcJob_ppt.getContentsCmtShare(listUID);
            // tắt ppt
            //console.log(track);
            if (
              track1 !== [] &&
              track1 !== false &&
              track1 !== undefined &&
              track1 !== ""
            ) {
              for (var j = 0; j < track1.length; j++) {
                output[numb] = new Array(...track1[j]);
                numb++;
              }
              await creatFileCSV(listUID, track1);
            } else {
              let valmess1 = {
                data:
                  '<li>- Không tìm thấy tương tác "Comment, Share" từ Link (string): ' +
                  listUID +
                  "</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess1);
            }
            var track2 = await funcJob_ppt.getContentsLike(listUID);
            //console.log(track);
            if (
              track2 !== [] &&
              track2 !== false &&
              track2 !== undefined &&
              track2 !== ""
            ) {
              for (var j = 0; j < track2.length; j++) {
                output[numb] = new Array(...track2[j]);
                numb++;
              }
              await creatFileCSV(listUID, track2);
            } else {
              let valmess2 = {
                data:
                  '<li>- Không tìm thấy tương tác "Like" từ Link (string): ' +
                  listUID +
                  "</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess2);
            }
          }
          if (output == [] || output == "" || output == false) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return output;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //searchSTTContentsinUID:searchSTTContentsinUID
    async function searchSTTContentsinUID(listUID) {
      if (listUID) {
        try {
          var list_contents = new Array();
          var numb = 0;
          if (
            listUID == undefined ||
            listUID == [] ||
            listUID == null ||
            listUID == "" ||
            listUID == false
          ) {
            let valmess9 = {
              data: "<li>- Không có dữ liệu để tìm kiếm</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess9);
            return false;
          }
          if (typeof listUID == "string") {
            let listUID0 = listUID;
            listUID = [];
            listUID[0] = [listUID0];
            listUID0 = [];
          }
          for (var i = 0; i < listUID.length; i++) {
            var listUID1 = await funcJob_ppt.getfacebookUID(
              listUID[i][0],
              true
            );
            if (
              listUID1 == undefined ||
              listUID1 == [] ||
              listUID1 == false ||
              listUID1 == null ||
              listUID1 == ""
            ) {
              let valmess1 = {
                data: "<li>- Không tìm thấy UID: " + listUID[i][0] + "</li>",
                checkbtn: true,
              };
              await socket.emit("update_message_str", valmess1);
            } else {
              var track = await funcJob_ppt.searchSTTContentsinUID(listUID1);
              if (
                track !== [] &&
                track !== false &&
                track !== undefined &&
                track !== ""
              ) {
                for (var j = 0; j < track.length; j++) {
                  list_contents[numb] = new Array(...track[j]);
                  numb++;
                }
                await creatFileCSV(listUID1, track);
              } else {
                let valmess1 = {
                  data:
                    "<li>- Không tìm thấy từ khóa trong UID: " +
                    listUID[i][0] +
                    "</li>",
                  checkbtn: true,
                };
                await socket.emit("update_message_str", valmess1);
              }
            }
            if (check_stop == true) {
              check_stop = false;
              break;
            }
          }
          if (
            list_contents == [] ||
            list_contents == false ||
            list_contents == ""
          ) {
            let valmess6 = {
              data: "<li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess6);
            return listUID;
          } else {
            return list_contents;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //add facebook problem, mỗi lần chỉ 1 UID
    async function addFbProblem(listUID) {
      if (
        listUID != undefined &&
        listUID.length > 0 &&
        listUID != false &&
        listUID != ""
      ) {
        try {
          var list_Fb = new Array();
          var getUIDList = await getfacebookUID(listUID, true);
          //lấy ra tài khoản cá nhân
          if (
            getUIDList[0] != undefined &&
            getUIDList[0] !== false &&
            getUIDList[0] !== [] &&
            getUIDList[0] !== "" &&
            typeof getUIDList[0] == "object" &&
            getUIDList[0].length > 1
          ) {
            var date = new Date();
            var data0 = {
              id_fb: getUIDList[0][0],
              type_fb: getUIDList[0][1],
              number_track: 0,
              problem: 0,
              lever: 0,
              created:
                date.getFullYear() +
                "-" +
                (date.getMonth() + 1) +
                "-" +
                date.getDate(),
            };
            await funcUser_ppt.addFbProblem(data0);
            list_Fb[0] = new Array(getUIDList[0][0], getUIDList[0][1]);
            console.log(" addFBProb: ", getUIDList[0][0], getUIDList[0][1]);
            let valmess = {
              data:
                "<li>- Đã thêm UID: " +
                getUIDList[0][0] +
                " (Type: " +
                getUIDList[0][1] +
                ") vào rà soát thường xuyên (Lever 0)</li>",
              checkbtn: true,
            };
            await socket.emit("update_message_str", valmess);
            //await creatFileCSV(getUIDList[i],data);
            if (check_stop == true) check_stop = false;
            return list_Fb;
          } else {
            let valmess = {
              data: "<li>- Không tìm thấy UID</li><li>- Hàm số không quét được dữ liệu. Lấy dữ liệu cũ liền trước chuyển hàm tiếp theo!</li><li><b>Done!</b></li>",
              checkbtn: false,
            };
            await socket.emit("update_message_str", valmess);
            return listUID;
          }
        } catch (err) {
          console.log(err);
          let valmess9 = {
            data:
              "<li>- Lỗi UID</li><li>- " + err + "</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess9);
          return false;
        }
      }
      return false;
    }
    //close puppeteer
    async function closePPT(data) {
      try {
        await listfb(); //thay doi list account fb
        await funcJob_ppt.closePuppeteer();
        number_change_facebook = 0;
        if (data !== false) {
          //hoặc bằng undefined
          let valmess10 = {
            data: "<li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess10);
        }
        console.log("closePuppeteer");
      } catch (err) {
        console.log(err);
        return;
      }
    }
    //list Window function
    var window = {
      getfacebookUID: getfacebookUID,
      getFriendsFb: getFriendsFb,
      getfollowingFb: getfollowingFb,
      getPagesFbUID: getPagesFbUID,
      getContentSTTFbUID: getContentSTTFbUID,
      getMembersGroup: getMembersGroup,
      getGroupsOfPages: getGroupsOfPages,
      getSubGroupsOGroups: getSubGroupsOGroups,
      getLinkVideoFB: getLinkVideoFB,
      UIDsigninGroups: UIDsigninGroups,
      fillContentSTTbyKeys: fillContentSTTbyKeys,
      searchPagesOrgroups: searchPagesOrgroups,
      searchSTTContents: searchSTTContents,
      getContentsLikeCmtShare: getContentsLikeCmtShare,
      searchSTTContentsinUID: searchSTTContentsinUID,
      addFbProblem: addFbProblem,
    };
    //chạy function theo array với 'arr' là danh sách các hàm thực hiện, còn 'textlink' là dự liệu đầu tiên
    async function LoadFunc(arr, textlink) {
      //console.log('arr/textlink of LoadFunc: '+ arr +'/' + textlink);
      try {
        if (arr == undefined || arr == [] || arr == "" || arr.length <= 0)
          arr[0] = [0, 0];
        var data = listjobFBInformation(2);
        //textlink là data dạng {a,b};
        var valdata = [];
        valdata[0] = new Array(textlink);
        var getData = [];
        console.log(valdata);
        for (var i = 0; i < arr.length; i++) {
          //các hàm đều có data đầu vào là 1 tham số, cần validate trong hàm riêng;

          var funcArr = data[Number(arr[i][0])];
          console.log("start funcArr: ", funcArr);
          var getData0 = await window[funcArr](valdata);
          console.log("getData0: " + getData0);
          if (check_stop == true || i + 1 == arr.length) {
            await resetCookies(true);
          } else {
            await resetCookies();
          } //reset thay đổi account facebook
          if (
            getData0 === false ||
            getData0 === "" ||
            getData0 === [] ||
            getData0 === undefined
          )
            break;
          if (i > 0 && arr[i][1] != arr[i - 1][1]) {
            getData = [];
          }

          if (
            getData0 != undefined &&
            getData0 != "" &&
            getData0 != [] &&
            getData0 != false &&
            typeof getData0 == "object"
          ) {
            for (var g = 0; g < getData0.length; g++) {
              getData.push(getData0[g]);
            }
          } else {
            getData.push(...getData0);
          }
          if (i > 0 && arr[i][1] != arr[i - 1][1]) {
            valdata = getData;
            getData0 = [];
          }
          //tạo danh sách xem dữ liệu, thêm dấu đỏ cho các data có vấn đề
          // if (creatFile.indexOf(Number(arr[i-1]))>=0) await creatFileCSV(valdata[i][0],getData);
          //không thay đổi data khi gặp các hàm này
          // if (data[Number(arr[i])]!="UIDsigninGroups" && data[Number(arr[i])]!="fillContentSTTbyKeys"){
          //     valdata=[];
          //     valdata=getData;
          // };
          if (check_stop == true) {
            check_stop = false;
            break;
          }
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }
    // tạo text JSON cho client
    async function creatFileCSV(UID0, array) {
      try {
        if (
          array != undefined &&
          array.length > 0 &&
          array != false &&
          array != ""
        ) {
          var UID = "";
          if (
            UID0 == "" ||
            UID0 == undefined ||
            UID0 == false ||
            UID0.indexOf("https://") >= 0
          ) {
            UID = "randomuid-" + Math.random() * 10000000000000;
          } else {
            UID = "file-" + UID0;
          }
          let valmess = {
            data:
              "<li>- UID: " +
              UID +
              " <b>get " +
              array.length +
              '</b> Link data (<a class="linkfilelist" id="' +
              UID +
              '" href="">File Path</a>)</li>',
            list: JSON.stringify(array),
            uid: UID,
          };
          await socket.emit("update_list_str", valmess);
          console.log("created arr: " + UID0);
        } else {
          let valmess3 = {
            data:
              "<li>- Dữ liệu trống (UID: " +
              UID0 +
              "), không tạo được data.</li>",
            checkbtn: true,
          };
          await socket.emit("update_list_str", valmess3);
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }
    async function listfb() {
      //tao list tai khoan facebook
      try {
        var dataAccountFB0 = await funcUser_ppt.getNumberLogin();
        var dataAccountFB = dataAccountFB0.sort(function (a, b) {
          return Number(a.number_login) - Number(b.number_login);
        });
        var listFB = "";
        if (dataAccountFB.length >= 1) {
          for (var i = 0; i < dataAccountFB.length; i++) {
            if (Number(dataAccountFB[i].number_login) <= 10) {
              if (dataAccountFB[i].number_login == null) {
                listFB +=
                  '<li class="li-userfb" id="user-' +
                  dataAccountFB[i].iduser +
                  '" style="margin-top:3px; border-radius: 3px; background-color: rgba(159, 255, 134, 0.699);"><button style="background:none; border: none;" us-id="icon-' +
                  dataAccountFB[i].iduser +
                  '" class="delete-userid"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button> ' +
                  dataAccountFB[i].user_name.split("@")[0] +
                  "... (1)</li>";
              } else {
                listFB +=
                  '<li class="li-userfb" id="user-' +
                  dataAccountFB[i].iduser +
                  '" style="margin-top:3px; border-radius: 3px; background-color: rgba(159, 255, 134, 0.699);"><button style="background:none; border: none;" us-id="icon-' +
                  dataAccountFB[i].iduser +
                  '" class="delete-userid"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button> ' +
                  dataAccountFB[i].user_name.split("@")[0] +
                  "... (" +
                  dataAccountFB[i].number_login +
                  ")</li>";
              }
            }
            if (
              Number(dataAccountFB[i].number_login) > 10 &&
              Number(dataAccountFB[i].number_login) <= 70
            ) {
              listFB +=
                '<li class="li-userfb" id="user-' +
                dataAccountFB[i].iduser +
                '" style="margin-top:3px; border-radius: 3px; background-color: rgba(248, 245, 47, 0.993);"><button style="background:none; border: none;" us-id="icon-' +
                dataAccountFB[i].iduser +
                '" class="delete-userid"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button> ' +
                dataAccountFB[i].user_name.split("@")[0] +
                "... (" +
                dataAccountFB[i].number_login +
                ")</li>";
            }
            if (Number(dataAccountFB[i].number_login) > 70) {
              listFB +=
                '<li class="li-userfb" id="user-' +
                dataAccountFB[i].iduser +
                '" style="margin-top:3px; border-radius: 3px; background-color: rgba(250, 167, 71, 0.993);"><button style="background:none; border: none;" us-id="icon-' +
                dataAccountFB[i].iduser +
                '" class="delete-userid"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button> ' +
                dataAccountFB[i].user_name.split("@")[0] +
                "... (" +
                dataAccountFB[i].number_login +
                ")</li>";
            }
          }
        }
        await socket.emit("update_account_str", listFB);
      } catch (err) {
        console.log(err);
        return;
      }
    }
    async function listkey() {
      //tao list tai khoan facebook
      try {
        var dataKeyFB0 = await funcUser_ppt.getAllKeyFb();
        var dataKeyFB = dataKeyFB0.sort(function (a, b) {
          return Number(b.appeared) - Number(a.appeared);
        });
        var listkeyFB = "";
        if (dataKeyFB.length >= 1) {
          for (var i = 0; i < dataKeyFB.length; i++) {
            listkeyFB +=
              '<li class="li-keyfb" id="key-' +
              dataKeyFB[i].keyword +
              '" style="margin-top:3px; border-radius: 3px; background-color: rgba(183, 245, 132, 0.993);"><button style="background:none; border: none;" key-id="icon-' +
              dataKeyFB[i].keyword +
              '" class="delete-keyid"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button> ' +
              dataKeyFB[i].main +
              " = " +
              dataKeyFB[i].keyword +
              "(" +
              dataKeyFB[i].appeared +
              ")</li>";
          }
        }
        await socket.emit("add_key_str", listkeyFB);
      } catch (err) {
        console.log(err);
        return;
      }
    }
    async function listTimes() {
      //tao list tai khoan facebook
      try {
        var dataTimeFB = await funcUser_ppt.getAllTimeRunAuto();
        var listTimeFB = "";
        if (dataTimeFB.length >= 1) {
          for (var i = 0; i < dataTimeFB.length; i++) {
            listTimeFB +=
              '<li class="li-timefb" id="time-' +
              dataTimeFB[i].id +
              '" style="margin-top:3px; border-radius: 3px; background-color: rgba(183, 245, 132, 0.993);"><button style="background:none; border: none;" id="timeicon-' +
              dataTimeFB[i].id +
              '" class="delete-timeid"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button> ' +
              dataTimeFB[i].creat_hour +
              " giờ " +
              dataTimeFB[i].creat_minute +
              " phút</li>";
          }
        }
        await socket.emit("add_time_str", listTimeFB);
      } catch (err) {
        console.log(err);
        return;
      }
    }
    //puppeteer=============================================================================================
    socket.on("adduser_str", async function (user_name, id_user) {
      //save
      socket.user_name = user_name;
      socket.id_user = id_user;
      // idConect.push(id_user);
      console.log("Username vừa kết nối SocketIO (puppeteer): " + user_name);
      // var post_md=require("../models/post");
      socket.join(id_user + "");
      //console.log('idUsser1: ', id_user);
      try {
        idConect_str[id_user + ""] = id_user; //xác định onl, off
        await addjobclient();
        await listfb(); //thay doi list account fb
        await listkey(); //thay đổi list key fb
        await listTimes(); //Thay đổi thời gian
        await addAccountFBdangerForClient(); //Thêm FB quét
        //thêm danh sách Job của server cho người dùng mới truy cập
        //var jobDB = await funcUser_ppt.getAllJob();
        //await socket.emit("update_job_client", valmess);
      } catch (err) {
        console.log(err);
        return;
      }
    });
    socket.on("disconnecting", function () {
      for (var i = 0; i < idConect_str.length; i++) {
        if (idConect_str[i] == socket.id_user) {
          idConect_str.splice(i, 1);
          break;
        }
      }
    });
    socket.on("delete_user_id_str", async function (iduser) {
      var funcUser_ppt = require("../models/user_ppt");
      try {
        var dete_userbyid = await funcUser_ppt.deleteUserbyID(iduser);
        console.log("deleted (" + iduser + "): " + dete_userbyid);
      } catch (err) {
        console.log(err);
        return false;
      }
    });
    socket.on("Stop_job_str", async function (check) {
      if (check == true) check_stop = true;
      if (check == false) check_stop = false;
    });
    socket.on("delete_key_id_str", async function (idkey) {
      try {
        var dete_keybyid = await funcUser_ppt.deleteKeyFb(idkey);
        console.log("deleted (" + idkey + "): " + dete_keybyid);
      } catch (err) {
        console.log(err);
        return false;
      }
    });
    socket.on("delete_time_id_str", async function (id) {
      try {
        await funcUser_ppt.deleteTimeRunAutoByID(id);
        console.log("deleted Time: " + id);
      } catch (err) {
        console.log(err);
        return false;
      }
    });
    socket.on("delete_job_sv", async function (id) {
      try {
        await funcUser_ppt.deleteJobByName(id);
        console.log("deleted: " + id);
        ///var data = await funcUser_ppt.getAllJob();
        await addjobclient();
      } catch (err) {
        console.log(err);
        return false;
      }
    });
    socket.on("delete_account_fb_danger", async function (uid) {
      try {
        try {
          await funcUser_ppt.deleteFbProblem(uid);
        } catch (err) {
          console.log("deleteFbProblem err is: ", err);
        }
        try {
          await funcUser_ppt.deleteIDContentByUID(uid);
        } catch (err) {
          console.log("deleteIDContentByUID err is: ", err);
        }
        try {
          await funcUser_ppt.deleteIDArletByUID(uid);
        } catch (err) {
          console.log("deleteIDArletByUID err is: ", err);
        }
        console.log("deleted FB: " + uid);
        await addAccountFBdangerForClient();
      } catch (err) {
        console.log(err);
        return false;
      };
    });
    socket.on("change_checkjob_sv", async function (id, change) {
      try {
        await funcUser_ppt.updateChangeJobByName(id, change);
        console.log("changed: " + id + " to " + change);
        //await addjobclient ();
      } catch (err) {
        console.log(err);
        return false;
      };
    });

    // socket.on("creat_link_id_str",async function (id) {
    //         try {
    //            if (id && id!= undefined){
    //                // array đâu
    //             await creatFileCSV(array,id)
    //             };
    //         } catch (err) {
    //             console.log(err);
    //             return false;
    //         };
    //     });
    socket.on("send_message_str", async function (messageJob, id_user) {
      //console.log('idUsser2: ', id_user);
      console.log("add funcUser_ppt and funcJob_ppt");
      //notify to myself/ thông tin gửi ngược lại cho mình
      if (id_user) {
        // thực hiện dòng lệnh từ puppeteer
        if (
          (messageJob.email == "" || messageJob.pass == "") &&
          messageJob.textlink == ""
        ) {
          let valmess0 = {
            data: "<li>- Not data!</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess0);
          console.log("Not data!");
          return false;
        }
        //login FB
        try {
          await funcJob_ppt.closePuppeteer(); //Tắt ppt cho chắc
          var success = await Login_puppeteer();
          //login account facebook
          await Login_facebook(success, messageJob.email, messageJob.pass);
          //console.log('permission/textlink/jobrunning: ' +getArrayClient +'/'+ textlink +'/'+ jobrunning);
          //running job
          if (messageJob.permission == "2" && messageJob.textlink.length > 0)
            await getLinkVideoFB(messageJob.textlink);
          if (
            messageJob.permission == "1" &&
            messageJob.textlink != undefined &&
            messageJob.textlink.length > 0
          ) {
            //get UID FB only
            if (
              messageJob.jobrunning == [] ||
              messageJob.jobrunning == "" ||
              messageJob.jobrunning == undefined ||
              messageJob.jobrunning == null
            ) {
              await getfacebookUID(messageJob.textlink, true);
            }

            //Thực hiện khi dòng lệnh có thêm một số chức năng
            if (
              messageJob.jobrunning != undefined &&
              messageJob.jobrunning != [] &&
              messageJob.jobrunning != "" &&
              messageJob.jobrunning != false
            ) {
              //đẩy hàm getArrayClient vào đây, hàm array hoàn chỉnh
              var getArrayClient = await updateArrayClient(
                messageJob.jobrunning
              );
              //console.log('ArrayClient: ' +messageJob.jobrunning);
              console.log("Function getArrayClient: " + getArrayClient);
              // tạo hàm chuyển đổi giữa chuỗi và function và chạy hàm
              if (
                getArrayClient != undefined &&
                getArrayClient.length > 0 &&
                messageJob.textlink.length > 0
              ) {
                var data = await LoadFunc(getArrayClient, messageJob.textlink);
              }
              // await LoadFunc(getArrayClient);
            }
          }
          // close PPT
          await closePPT(data);
        } catch (err) {
          console.log(err);
          return;
        }
      } else {
        try {
          let valmess11 = {
            data: "<li>- Access error!</li><li><b>Done!</b></li>",
            checkbtn: false,
          };
          await socket.emit("update_message_str", valmess11);
          console.log("Server Access error!");
          return;
        } catch (err) {
          console.log(err);
          return;
        }
      }
      // })();
    });
    socket.on("send_job_sv", async function (job, id_user) {
      if (id_user && job) {
        try {
          if (funcUser_ppt.removeVietnameseTones(job.name) == "") return false;
          //thêm data vào server
          var asynauto = require("../models/asyncautoload_ppt");
          var listJ = await asynauto.updateArrayClient(job.listjob);
          var jobDB = {
            name: funcUser_ppt.removeVietnameseTones(job.name),
            listjob: JSON.stringify(listJ),
            checkrun: 0,
            trainning: 0,
          };
          var checkname = await funcUser_ppt.getJobByName(jobDB.name);
          if (
            checkname != undefined &&
            checkname != null &&
            checkname != [] &&
            checkname != ""
          ) {
            console.log("Đã Tồn tại Job tên này trong DB");
            return;
          } else {
            await funcUser_ppt.addJob(jobDB);
            console.log("Đã thêm 1 Job vào DB");
          }
          //them dữ liệu về client
          await addjobclient();
          //console.log('valmess',valmess)
          //await socket.emit("update_job_client", valmess);
        } catch (err) {
          console.log(err);
          return;
        }
      }
    });
    // function chạy thêm thẻ li vào client
    async function addjobclient() {
      //console.log('data', data);
      //if (data){
      try {
        var list = "";
        var data = await funcUser_ppt.getAllJob();
        if (data && data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            // Thêm Danh sách nhiệm vụ
            var arrRun = JSON.parse(data[i].listjob);
            if (arrRun && arrRun.length > 0) {
              //console.log('arrRun', arrRun);
              var textRun = "";
              for (var j = 0; j < arrRun.length; j++) {
                if (j < arrRun.length - 1) {
                  textRun += listjobFBInformation(3, arrRun[j]) + "; ";
                } else {
                  textRun += listjobFBInformation(3, arrRun[j]);
                }
              }
            }
            if (data[i].checkrun == 2) {
              list +=
                '<li title="' +
                textRun +
                '"class="li-job" id="jobsv-' +
                data[i].name +
                '" style="margin-top:3px; border-radius: 3px; background-color: rgba(159, 255, 134, 0.699);"><button style="background:none; border: none;" id="btn-job-' +
                data[i].name +
                '" class="delete-jobsv"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button>' +
                data[i].name +
                " (" +
                data[i].trainning +
                ') <input type="checkbox" id="job-ip-' +
                data[i].name +
                '" checked class="checkbox-inline check-job-ip"></li>';
            } else {
              list +=
                '<li title="' +
                textRun +
                '"class="li-job" id="jobsv-' +
                data[i].name +
                '" style="margin-top:3px; border-radius: 3px; background-color: rgba(159, 255, 134, 0.699);"><button style="background:none; border: none;" id="btn-job-' +
                data[i].name +
                '" class="delete-jobsv"><i class="fa fa-remove fa-1x " style="color: rgb(250, 64, 64); margin-right: 5px;"></i></button>' +
                data[i].name +
                " (" +
                data[i].trainning +
                ') <input type="checkbox" id="job-ip-' +
                data[i].name +
                '" class="checkbox-inline check-job-ip"></li>';
            }
          }
          await socket.emit("update_job_client", list);
          //return list;
        }
      } catch (err) {
        console.log(err);
      }
      //return false;
    }
    async function addAccountFBdangerForClient() {
      try {
        var data = await funcUser_ppt.getAllFbProb();
        if (data == undefined || data == [] || data === false || data == "")
          return false;
        var list = "";
        for (var i = 0; i < data.length; i++) {
          //lấy ra Danh sách STT danger
          try {
            var listSTT = await funcUser_ppt.getSTTProbByFBID(data[i].id_fb);
            var titleSTT = "";
            if (listSTT && listSTT.length > 0) {
              for (var j = 0; j < listSTT.length; j++) {
                titleSTT +=
                  '<a href="' +
                  listSTT[j].link_stt +
                  '" target="_blank">' +
                  listSTT[j].key_train +
                  "</a>; ";
              }
              titleSTT = "(" + titleSTT + ")";
            }
          } catch (err) {
            var titleSTT = "";
          }
          // Thêm Danh sách nhiệm vụ
          if (data[i].lever >= 1) {
            list +=
              '<li class="li-account-fb-danger" id="dgli-' +
              data[i].id_fb +
              '" style="margin-top:3px; border-radius: 3px; background-color: rgb(250, 64, 64);"><button style="background:none; border: none;" id="dg-' +
              data[i].id_fb +
              '" class="delete-accountfbdanger"><i class="fa fa-remove fa-1x " style="color: rgba(159, 255, 134, 0.699); margin-right: 5px;"></i></button><a href="https://www.facebook.com/' +
              data[i].id_fb +
              '" target="_blank">' +
              data[i].id_fb +
              "</a> (Tracked: " +
              data[i].number_track +
              " " +
              titleSTT +
              "; Created: " +
              data[i].created +
              ")</li>";
          }
          if (data[i].lever == 0) {
            list +=
              '<li class="li-account-fb-danger" id="dgli-' +
              data[i].id_fb +
              '" style="margin-top:3px; border-radius: 3px; background-color: rgba(159, 255, 134, 0.699);"><button style="background:none; border: none;" id="dg-' +
              data[i].id_fb +
              '" class="delete-accountfbdanger"><i class="fa fa-remove fa-1x " style="color: rgb(200, 10, 10); margin-right: 5px;"></i></button><a href="https://www.facebook.com/' +
              data[i].id_fb +
              '" target="_blank">' +
              data[i].id_fb +
              "</a> (Tracked: " +
              data[i].number_track +
              " " +
              titleSTT +
              "; Created: " +
              data[i].created +
              ")</li>";
          }
        }
        socket.emit("update_account_fb_danger", list);
      } catch (err) {
        console.log(err);
        return;
      }
    }
    socket.on("send_key_str", async function (keys, id_user) {
      var funcUser_ppt = require("../models/user_ppt");
      // var funcJob_ppt = require("../models/asyncfunction");
      try {
        var get_keyby_key = await funcUser_ppt.getKeyFb(keys);
        if (
          (get_keyby_key[0] == undefined ||
            get_keyby_key.length == 0 ||
            get_keyby_key == null ||
            get_keyby_key == false ||
            get_keyby_key == "") &&
          id_user != ""
        ) {
          await funcUser_ppt.addKeyFb(keys);
          await listkey();
        } else {
          await listkey();
        }
      } catch (err) {
        console.log(err);
        return;
      }
    });
    socket.on("send_time_str", async function (data0, id_user) {
      var funcUser_ppt = require("../models/user_ppt");
      // var funcJob_ppt = require("../models/asyncfunction");
      var data = {
        creat_hour: data0.split(":")[0],
        creat_minute: data0.split(":")[1],
      };

      try {
        var time = await funcUser_ppt.getTimebyTime(data);
        if (
          (time[0] == undefined ||
            time.length == 0 ||
            time == null ||
            time == false ||
            time == "") &&
          id_user != ""
        ) {
          await funcUser_ppt.addTimeAuto(data);
          await listTimes();
        } else {
          await listTimes();
        }
      } catch (err) {
        console.log(err);
        return;
      }
    });
  });
};
