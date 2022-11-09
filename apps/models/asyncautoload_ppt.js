var funcUser_ppt = require("../models/user_ppt");
var funcJob_ppt = require("../models/asyncfunction");
var number_change = 0; //đếm số lần biến đổi khi sử dụng tài khoản facebook,
var check_stop = false; //kiểm tra dữ liệu để ngừng hàm bất chợt
//var number_change_facebook=0;
async function resetCookies(check) {
  if (number_change > 30) {
    await funcJob_ppt.deleteCookiesInPPT();
    number_change = 0;
    if (check !== true) await funcJob_ppt.Login_facebook(true, "", "");
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
    arrReturn.push(0);
  } else {
    // var ArrayJob0=[]; var numb0=0;
    // for (var j=0;j<ArrayJob;j++) {
    //     if(ArrayJob[j][1])
    //     ArrayJob0[numb0]= new Array(...ArrayJob0[numb0],ArrayJob[j][0])
    // };
    for (var i = 0; i < ArrayJob.length; i++) {
      if (i > 3) break;
      if (i === 0 && ArrayJob[0] == 0) {
        arrReturn.push(0);
      } else {
        arrReturn.push(ArrayJob[i]);
      }
      if (ArrayJob.length <= i + 1) break;
      // lấy tất cả khả năng arr trước
      //var dataArrSum0=[];
      if (i > 0 && dataIndex[ArrayJob[i]].indexOf(ArrayJob[i + 1]) < 0) break;
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
    "getSubGroupsOGroups",
  ];
  if (data === "index") {
    var data_name_job_IndexAfder = new Array();
    data_name_job_IndexAfder[0] = new Array(1, 2, 4, 5, 6, 8, 13, 14); //3
    data_name_job_IndexAfder[1] = new Array(1, 2, 4, 8); //0,3
    data_name_job_IndexAfder[2] = new Array(1, 2, 4, 5, 6, 8, 14); //0,3
    data_name_job_IndexAfder[3] = new Array(4, 6, 14);
    data_name_job_IndexAfder[4] = new Array(9, 12);
    data_name_job_IndexAfder[5] = new Array(1, 2, 4, 5, 6, 8, 14); //0,3
    data_name_job_IndexAfder[6] = new Array(9, 4, 5, 8, 12, 13); //0
    data_name_job_IndexAfder[7] = new Array();
    data_name_job_IndexAfder[8] = new Array();
    data_name_job_IndexAfder[9] = new Array();
    data_name_job_IndexAfder[10] = new Array(9, 4, 6, 8, 12, 13, 14); //0
    data_name_job_IndexAfder[11] = new Array(9);
    data_name_job_IndexAfder[12] = new Array(13, 4); //0
    data_name_job_IndexAfder[13] = new Array(9);
    //data_name_job_IndexAfder[14] = new Array();
    data_name_job_IndexAfder[14] = new Array(9, 4, 5, 8, 12, 13); //0
    return data_name_job_IndexAfder;
  }
  if (data === 2) {
    return data_name_job;
  }
  if (
    data === 3 &&
    data > 2 &&
    job !== "" &&
    job !== null &&
    job !== undefined
  ) {
    var numjob = data_name_job.indexOf(job);
    if (numjob >= 0) return numjob;
    return false;
  }
  if (data === "start") {
    var arrDataNotUID = [1, 2, 4, 6, 8, 10, 11, 12, 13, 14];
    return arrDataNotUID;
  }
  return false;
}
//login puppeteer
async function Login_puppeteer() {
  const lauch = await funcJob_ppt.launchPuppeteer();
  //console.log('lauch: '+lauch);
  if (lauch == false) return false;
  console.log("Launch Puppeteer success!");
  return true;
}
//     async function Login_facebook (success){
//     //Login User!
//     if (success===false){
//         console.log('add Accout FB err!');
//         return false;
//     };
//     var login = [];
//     var usernotCookie = await funcUser_ppt.getFBnotCookie();
//     console.log("usernotCookie: "+ usernotCookie[0]);
//     if (usernotCookie[0] !== undefined && usernotCookie.length>0 && usernotCookie[0] !== false) {
//         console.log("start loginfacebookwithUser");
//         login = await funcJob_ppt.loginfacebookwithUser(usernotCookie[0].user_name, usernotCookie[0].password);
//     } else {
//         do {
//             login = await funcJob_ppt.loginwebFBwithCookie();
//             console.log('login: ', login);
//         } while (login === 2);
//     }
//     if (login === false || login === [] || login === "" || login === undefined) {
//         //await listfb();//thay doi list account fb
//         console.log('Login Facebook failed!');
//         return await funcJob_ppt.closePuppeteer();
//     };
//         console.log('Login Facebook Success!');
//         number_change=0
//  };
//get video function
async function getLinkVideoFB(textlink) {
  try {
    if (
      textlink != undefined &&
      textlink.length > 0 &&
      textlink != false &&
      textlink != "" &&
      textlink != [] &&
      textlink != null
    ) {
      if (textlink.indexOf("https://") < 0 && textlink.indexOf(".com") < 0) {
        textlink = "https://www.facebook.com/" + textlink;
      }
      var valLink = await funcJob_ppt.getLinkVideoFB(textlink);
      number_change++;
      await resetCookies();
      console.log("valLink: " + valLink);
      if (valLink !== false) {
        return valLink;
      }
    }
  } catch (err) {
    console.log(err);
  }
}
//get UID facebook
async function getfacebookUID(textlink, type) {
  console.log("start get FB UID: " + textlink);
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
          number_change++;
          if (UID0 != "" && UID0 != [] && UID0 != false && UID0 != undefined) {
            UID.push(UID0[0]);
          }
          //console.log('valLink: ' + UID);
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
          number_change++;
          if (UID0 != "" && UID0 != [] && UID0 != false && UID0 != undefined) {
            UID.push(UID0[0]);
          }
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
        number_change++;
        if (UID != "" && UID != [] && UID != false && UID != undefined) {
          return UID;
        }
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
//get UID facebook
async function getFriendsFb(listUID) {
  if (
    listUID != undefined &&
    listUID.length > 0 &&
    listUID != false &&
    listUID != ""
  ) {
    try {
      var list_friend = new Array();
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
      for (var i = 0; i < getUIDList.length; i++) {
        var data = await funcJob_ppt.getFriendsFb(getUIDList[i]);
        if (
          data != [] &&
          data != "" &&
          data != undefined &&
          data != null &&
          data != false
        ) {
          for (var l = 0; l < data.length; l++) {
            list_friend[numbarr1] = new Array(...data[l]);
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (list_friend == [] || list_friend == "" || list_friend == false) {
        return listUID;
      } else {
        return list_friend;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
//getfollowingFb
async function getfollowingFb(listUID) {
  if (
    listUID != undefined &&
    listUID.length > 0 &&
    listUID != false &&
    listUID != ""
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
      for (var i = 0; i < getUIDList.length; i++) {
        var data = await funcJob_ppt.getfollowingFb(getUIDList[i]);
        if (
          data != [] &&
          data != "" &&
          data != undefined &&
          data != null &&
          data != false
        ) {
          for (var l = 0; l < data.length; l++) {
            list_followingFb[numbarr1] = new Array(...data[l]);
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_followingFb == [] ||
        list_followingFb == "" ||
        list_followingFb == false
      ) {
        return listUID;
      } else {
        return list_followingFb;
      }
    } catch (err) {
      console.log(err);
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
      }
      if (
        getUIDList == [] ||
        getUIDList == "" ||
        getUIDList == false ||
        getUIDList == undefined
      )
        return listUID;
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
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_PageOfFb == [] ||
        list_PageOfFb == "" ||
        list_PageOfFb == false
      ) {
        return listUID;
      } else {
        return list_PageOfFb;
      }
    } catch (err) {
      console.log(err);
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
        getUIDList0 == [] ||
        getUIDList0 == false ||
        getUIDList0 == undefined ||
        getUIDList0 == "" ||
        typeof getUIDList0 != "object"
      )
        return listUID;
      for (var i = 0; i < getUIDList0.length; i++) {
        var data = await funcJob_ppt.getContentSTTFbUID(getUIDList0[i][0]);
        if (data != [] && data != "" && data != undefined && data != null) {
          for (var l = 0; l < data.length; l++) {
            list_SttOfFb[numbarr1] = new Array(...data[l]);
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      // Thêm số lần Track
      if (list_SttOfFb == [] || list_SttOfFb == "" || list_SttOfFb == false) {
        return listUID;
      } else {
        return list_SttOfFb;
      }
    } catch (err) {
      console.log(err);
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
      for (var i = 0; i < getUIDList.length; i++) {
        var data = await funcJob_ppt.getMembersGroup(getUIDList[i]);
        if (
          data != [] &&
          data != "" &&
          data != undefined &&
          data != null &&
          data != false
        ) {
          for (var i = 0; i < data.length; i++) {
            list_MembersOfGr[numbarr1] = new Array(...data[i]);
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_MembersOfGr == [] ||
        list_MembersOfGr == "" ||
        list_MembersOfGr == false
      ) {
        return listUID;
      } else {
        return list_MembersOfGr;
      }
    } catch (err) {
      console.log(err);
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
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
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_GroupOfPage == [] ||
        list_GroupOfPage == false ||
        list_GroupOfPage == ""
      ) {
        return listUID;
      } else {
        return list_GroupOfPage;
      }
    } catch (err) {
      console.log(err);
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
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
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_GroupOfPage == [] ||
        list_GroupOfPage == false ||
        list_GroupOfPage == ""
      ) {
        return listUID;
      } else {
        return list_GroupOfPage;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
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
            data[l] = [];
            numbarr1++;
          }
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_GroupOfPage == [] ||
        list_GroupOfPage == false ||
        list_GroupOfPage == ""
      ) {
        return listUID;
      } else {
        return list_GroupOfPage;
      }
    } catch (err) {
      console.log(err);
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
      var dataSV = [];
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
      }
      if (getUIDList == [] || getUIDList == "" || getUIDList == false)
        return listUID;
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
          // Thêm vào DB ID có alert
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
            await funcUser_ppt.updateLeverAndProbByUID(
              getUIDList[i],
              trackProb[0].lever + 1,
              1,
              adddate
            );
            //await funcUser_ppt.updateProbByUID(getUIDList[i], 1, adddate);
          } else {
            // Thêm mới dữ liệu
            let data = {
              id_fb: getUIDList[i],
              type_fb: "userID",
              number_track: 0,
              problem: 1,
              lever: 0,
              created: adddate,
            };
            dataSV.push(data);
            //await funcUser_ppt.addFbProblem(data);
          }
          //await addAccountFBdangerForClient()
        }
        number_change++;
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (dataSV != [] && dataSV.length > 0) {
        await funcUser_ppt.addFbProblem(dataSV);
        console.log("Đã thêm UID err: ", dataSV.length);
        dataSV = [];
      }

      if (
        list_UIDSignGroup == [] ||
        list_UIDSignGroup == "" ||
        list_UIDSignGroup == false
      ) {
        return listUID;
      } else {
        return list_UIDSignGroup;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
//fillContentSTTbyKeys
async function fillContentSTTbyKeys(listUID) {
  // link đầy đủ cả https://
  if (listUID) {
    try {
      var list_STTDanger = new Array();
      var numb = 0;
      var dataSV = [];
      var ListSTTSV = [];
      var number_track_true = 0;
      var max_track_true = 3;
      if (
        listUID == undefined ||
        listUID == [] ||
        listUID == null ||
        listUID == "" ||
        listUID == false
      )
        return listUID;
      if (typeof listUID == "string") {
        let listUID0 = listUID;
        listUID = [];
        listUID[0] = ["random", listUID0];
        listUID0 = [];
      }
      if (
        listUID == [] ||
        listUID == "" ||
        listUID == undefined ||
        listUID[0] == [] ||
        (listUID[0] == "" && listUID[0] == undefined) ||
        listUID[0][1] == undefined ||
        listUID[0][1] == ""
      ) {
        console.log("Not scan content STT: ", listUID);
        return listUID;
      }
      var AllSTTProb = await funcUser_ppt.getAllSTTProb();
      var AllFBProb = await funcUser_ppt.getAllFBProb();
      var Keys = await funcUser_ppt.getAllKeyFb();
      for (var i = 0; i < listUID.length; i++) {
        let track = await funcJob_ppt.fillContentSTTbyKeys(listUID[i][1], Keys);

        // Thêm số Tracker và UID
        //console.log(track);
        if (track !== false) {
          // Thêm vào DB ID có alert
          var STTProb = false;
          for (let STTProbs of AllSTTProb) {
            if (STTProbs.link_stt == listUID[i][0]) {
              STTProb = true;
              break;
            }
          }
          if (number_track_true >= max_track_true) {
            console.log("break fillContentbyKey");
            break; //nếu đủ 3 link thì ngắt hàm, tính trong tất cả dữ liệu đẩy vào hàm khi chạy
          }
          if (STTProb == false) {
            // await funcUser_ppt.addFbStt(SttDB);
            var UID = await funcJob_ppt.getUIDBylinkSTT(listUID[i][0], true);
            number_track_true++; //console.count();
            if (
              UID == [] ||
              UID == "" ||
              UID == undefined ||
              typeof UID != "object"
            ) {
              console.log(
                "không tìm thấy UID từ: ",
                listUID[i][0],
                ", UID is: ",
                UID
              );
            } else {
              // nếu chưa tồn tại thì thêm mới vào Danh sách
              let SttDB = {
                link_stt: listUID[i][0],
                id_fb: UID[0][0],
                number_track: 0,
                check_info: 0,
                key_train: track,
              };
              ListSTTSV.push(SttDB);
              //var trackProb = await funcUser_ppt.getFBProbByUID(UID[0][0]);
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
                //await funcUser_ppt.updateLeverAndProbByUID(UID[0][0], trackProb.lever+1,1 , adddate);
                //await funcUser_ppt.updateProbByUID(UID[0][0], 1, adddate);
                console.log("Đã tồn tại UID danger: ", UID);
              } else {
                // Thêm mới dữ liệu
                console.log("Phát hiện mới UID danger: ", UID);
                //var date = new Date();
                let data = {
                  id_fb: UID[0][0],
                  type_fb: UID[0][1],
                  number_track: 0,
                  problem: 1,
                  lever: 1,
                  created: adddate,
                };
                dataSV.push(data);
                //await funcUser_ppt.addFbProblem(data);
              }
            }
          } else {
            console.log("STT đã tồn tại");
          }
          //await addAccountFBdangerForClient()
          list_STTDanger[numb] = new Array(listUID[i]);
          numb++;
        } else {
          //console.log('Tracked is false: '+ listUID[i][0]);
        }
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (ListSTTSV != [] && ListSTTSV.length > 0) {
        await funcUser_ppt.addFbStt(ListSTTSV);
        console.log("Đã thêm STT err: ", ListSTTSV.length);
        ListSTTSV = [];
      }
      if (dataSV != [] && dataSV.length > 0) {
        // Thêm FB danger và SV
        await funcUser_ppt.addFbProblem(dataSV);
        console.log("Đã thêm UID err: ", dataSV.length);
        dataSV = [];
      }
      if (
        list_STTDanger == [] ||
        list_STTDanger == "" ||
        list_STTDanger == undefined
      ) {
        return listUID;
      } else {
        return list_STTDanger;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
//searchPagesOrgroups
async function searchPagesOrgroups(listUID) {
  if (listUID) {
    try {
      var list_PageOrGroup = new Array();
      var numbarr = 0;
      if (
        listUID == undefined ||
        listUID == [] ||
        listUID == null ||
        listUID == "" ||
        listUID == false
      )
        return false;
      // if (typeof (listUID)=="string" || (typeof (listUID)=="object" && listUID[0](0)===undefined)) listUID=[listUID];
      var track = new Array();
      if (typeof listUID == "object" && typeof listUID[0] == "object") {
        for (var i = 0; i < listUID.length; i++) {
          track[i] = new Array(
            ...(await funcJob_ppt.searchPagesOrgroups(listUID[i][0]))
          );
          if (check_stop == true) {
            check_stop = false;
            break;
          }
        }
      } else if (typeof listUID == "object" && typeof listUID[0] == "string") {
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
        track[0] = new Array(
          ...(await funcJob_ppt.searchPagesOrgroups(listUID))
        );
      }
      if (
        track !== [] &&
        track !== false &&
        track !== undefined &&
        track !== "" &&
        typeof track == "object" &&
        typeof track[0] == "object"
      ) {
        for (var i = 0; i < track.length; i++) {
          for (var j = 0; j < track[i].length; j++) {
            list_PageOrGroup[numbarr] = new Array(...track[i][j]);
            numbarr++;
          }
          track[i] = [];
          if (check_stop == true) {
            check_stop = false;
            break;
          }
        }
      } else {
        return false;
      }
      if (
        list_PageOrGroup == [] ||
        list_PageOrGroup == "" ||
        list_PageOrGroup == false
      ) {
        return listUID;
      } else {
        return list_PageOrGroup;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
//searchSTTContents:searchSTTContents,
async function searchSTTContents(listUID) {
  if (listUID) {
    try {
      var list_STT = new Array();
      var numbarr = 0;
      var track = [];
      if (
        listUID == undefined ||
        listUID == [] ||
        listUID == null ||
        listUID == "" ||
        listUID == false
      )
        return false;
      // if (typeof (listUID)=="string" || (typeof (listUID)=="object" && listUID[0](0)===undefined)) listUID=[listUID];
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
      } else if (typeof listUID == "object" && typeof listUID[0] == "string") {
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
        track[0] = new Array(...(await funcJob_ppt.searchSTTContents(listUID)));
      }
      if (
        track !== [] &&
        track !== false &&
        track !== undefined &&
        track !== "" &&
        typeof track == "object" &&
        typeof track[0] == "object"
      ) {
        for (var i = 0; i < track.length; i++) {
          for (var j = 0; j < track[i].length; j++) {
            list_STT[numbarr] = new Array(...track[i][j]);
            numbarr++;
          }
          track[i] = [];
          if (check_stop == true) {
            check_stop = false;
            break;
          }
        }
      } else {
        return false;
      }
      if (list_STT == [] || list_STT == "" || list_STT == false) {
        return listUID;
      } else {
        return list_STT;
      }
    } catch (err) {
      console.log(err);
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
      )
        return false;
      // if (typeof (listUID)=="string" || (typeof (listUID)=="object" && listUID[0](0)===undefined)) listUID=[listUID];
      if (typeof listUID == "object" && typeof listUID[0] == "object") {
        for (var i = 0; i < listUID.length; i++) {
          var track1 = await funcJob_ppt.getContentsCmtShare(listUID[i][0]);
          if (
            track1 !== [] &&
            track1 !== false &&
            track1 !== undefined &&
            track1 !== ""
          ) {
            for (var j = 0; j < track1.length; j++) {
              output[numb] = new Array(...track1[j]);
              track1[j] = [];
              numb++;
            }
          }
          var track2 = await funcJob_ppt.getContentsLike(listUID[i][0]);
          if (
            track2 !== [] &&
            track2 !== false &&
            track2 !== undefined &&
            track2 !== ""
          ) {
            for (var j = 0; j < track2.length; j++) {
              output[numb] = new Array(...track2[j]);
              track2[j] = [];
              numb++;
            }
          }
          if (check_stop == true) {
            check_stop = false;
            break;
          }
        }
      } else if (typeof listUID == "object" && typeof listUID[0] == "string") {
        for (var i = 0; i < listUID.length; i++) {
          var track1 = await funcJob_ppt.getContentsCmtShare(listUID[i]);
          if (
            track1 !== [] &&
            track1 !== false &&
            track1 !== undefined &&
            track1 !== ""
          ) {
            for (var j = 0; j < track1.length; j++) {
              output[numb] = new Array(...track1[j]);
              track1[j] = [];
              numb++;
            }
          }
          var track2 = await funcJob_ppt.getContentsLike(listUID[i]);
          if (
            track2 !== [] &&
            track2 !== false &&
            track2 !== undefined &&
            track2 !== ""
          ) {
            for (var j = 0; j < track2.length; j++) {
              output[numb] = new Array(...track2[j]);
              track2[j] = [];
              numb++;
            }
          }
          if (check_stop == true) {
            check_stop = false;
            break;
          }
        }
      } else if (typeof listUID == "string") {
        var track1 = await funcJob_ppt.getContentsCmtShare(listUID);
        if (
          track1 !== [] &&
          track1 !== false &&
          track1 !== undefined &&
          track1 !== ""
        ) {
          for (var j = 0; j < track1.length; j++) {
            output[numb] = new Array(...track1[j]);
            track1[j] = [];
            numb++;
          }
        }
        var track2 = await funcJob_ppt.getContentsLike(listUID);
        if (
          track2 !== [] &&
          track2 !== false &&
          track2 !== undefined &&
          track2 !== ""
        ) {
          for (var j = 0; j < track2.length; j++) {
            output[numb] = new Array(...track2[j]);
            track2[j] = [];
            numb++;
          }
        }
      }
      if (output == [] || output == "" || output == false) {
        return listUID;
      } else {
        return output;
      }
    } catch (err) {
      console.log(err);
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
      )
        return false;
      if (typeof listUID == "string") {
        let listUID0 = listUID;
        listUID = [];
        listUID[0] = [listUID0];
        listUID0 = [];
      }
      for (var i = 0; i < listUID.length; i++) {
        var listUID1 = await funcJob_ppt.getfacebookUID(listUID[i], true);
        if (
          listUID1 != undefined &&
          listUID1 != [] &&
          listUID1 != false &&
          listUID1 != null &&
          listUID1 != ""
        ) {
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
          }
        }
        if (check_stop == true) {
          check_stop = false;
          break;
        }
      }
      if (
        list_contents == [] ||
        list_contents == "" ||
        list_contents == false
      ) {
        return listUID;
      } else {
        return list_contents;
      }
    } catch (err) {
      console.log(err);
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
        typeof getUIDList[0] == "object"
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
        await funcUser_ppt.addFbProblem(data0); // Thêm vào danh sách FB bất thường
        list_Fb[0] = new Array(getUIDList[0][0], getUIDList[0][1]);
        console.log(" addFBProb: ", getUIDList[0][0], getUIDList[0][1]);
        if (check_stop == true) check_stop = false;
        return list_Fb;
      } else {
        return listUID;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return false;
}
//close puppeteer
async function closePPT() {
  //await listfb();//thay doi list account fb
  await funcJob_ppt.closePuppeteer();
  number_change = 0;
  //console.log('closePuppeteer');
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
  try {
    if (
      arr == undefined ||
      arr == [] ||
      arr == "" ||
      arr == false ||
      arr.length <= 0
    )
      arr = [0];
    var data = listjobFBInformation(2);
    //textlink là data dạng {a,b};
    var valdata = new Array();
    valdata[0] = new Array(textlink);
    //console.log(arr);
    for (var i = 0; i < arr.length; i++) {
      //các hàm đều có data đầu vào là 1 tham số, cần validate trong hàm riêng;
      var funcArr = data[Number(arr[i])];
      console.log("start funcArr: ", funcArr);
      //if (TimeRestartSV==0) {
      var getData0 = await window[funcArr](valdata);
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
      var getData = [];
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
        getData.push(getData0);
      }
      //không thay đổi data khi gặp các hàm này
      // if (data[Number(arr[i])]!="UIDsigninGroups" && data[Number(arr[i])]!="fillContentSTTbyKeys"){
      //     valdata=[];
      valdata = getData;
      getData0 = [];
      // };
      if (check_stop == true) {
        check_stop = false;
        break;
      }
    }
    return valdata;
  } catch (err) {
    console.log(err);
    return false;
  }
}
async function runFuncFile() {
  try {
    //login FB
    console.log("Start runFuncFile");
    // await funcJob_ppt.closePuppeteer();//Tắt ppt cho chắc
    // var success = await Login_puppeteer();
    // //login account facebook
    // await Login_facebook (success);
    //lấy ra text link job alert và nhiệm vụ cần làm tại server
    var text = [];
    var text1 = [];
    //var check_scan=0;
    var fbTrain = await funcUser_ppt.getAllFbProb();
    if (
      fbTrain == [] ||
      fbTrain == undefined ||
      fbTrain === false ||
      fbTrain === ""
    ) {
      console.log("Not FbProb");
      return false;
    }

    for (var j = 0; j < fbTrain.length; j++) {
      if (
        fbTrain[j].number_track <= 0 &&
        fbTrain[j].problem > 0 &&
        fbTrain[j].lever > 0
      ) {
        text = fbTrain[j];
        //break;
      }
      // lấy facebook quét thường xuyên
      if (fbTrain[j].problem == 0 && fbTrain[j].lever == 0) {
        text1 = fbTrain[j];
        //break;
      }
      // };
      if (text == [] && text1 == []) {
        console.log("Not UID scan");
        //return false;
      } else {
        var jobrun;
        if (
          (text == [] || text == "" || text == false) &&
          (text1 != [] || text1 != "" || text1 != false)
        ) {
          text = text1;
          jobrun = [4, 9]; //check_scan=1;
        } else {
          var dataJob = await funcUser_ppt.getAllJob(); //lấy ra danh sách tất cả nhiệm vụ cầm làm
          if (
            dataJob == [] ||
            dataJob == undefined ||
            dataJob === false ||
            dataJob == ""
          ) {
            // nếu không có dataJob thì quét thường xuyên như trên
            jobrun = [4, 9];
          } else {
            jobrun = [4, 9];
            for (var i = 0; i < dataJob.length; i++) {
              if (dataJob[i].checkrun == 2) {
                jobrun = JSON.parse(dataJob[i].listjob);
                await funcUser_ppt.updateTrainJobByName(
                  dataJob[i].name,
                  dataJob[i].trainning + 1
                ); // thêm lượt tương tác với JOB +1
                break;
              }
            }
          }
        }
        //console.log('wailting...');
        //running job
        if (text != undefined && text != "" && text != [] && text != false) {
          console.log("running job, jobrun: " + jobrun);
          //Thực hiện khi dòng lệnh có thêm một số chức năng
          if (
            jobrun != undefined &&
            jobrun != [] &&
            jobrun != "" &&
            jobrun != false
          ) {
            //đẩy hàm getArrayClient vào đây, hàm array hoàn chỉnh
            var getArrayClient = await updateArrayClient(jobrun);
            //console.log('getArrayClient: ', getArrayClient);
            // tạo hàm chuyển đổi giữa chuỗi và function và chạy hàm
            if (
              getArrayClient != undefined &&
              getArrayClient.length > 0 &&
              getArrayClient != false &&
              getArrayClient != ""
            ) {
              await funcJob_ppt.closePuppeteer(); //Tắt ppt cho chắc
              var success = await Login_puppeteer();
              // if (text.type_fb!='pageID' && text.type_fb!='groupID' && check_scan==1){
              //chỉ dùng cho UID kép kín không cần quyền truy cập từ account và quét thường xuyên check_scan==1
              await funcJob_ppt.Login_facebook(success); //login account facebook
              //};
              //var TimeRestartSV=0;// nếu bằng 1 thì chỉnh sửa lại các hàm con để lấy lệnh đệ quy hàm
              await LoadFunc(getArrayClient, text.id_fb);
              await closePPT();
              // thêm track vào UID
              await addTrackerFBScan(text.id_fb);
            }
          }
        }
        text = [];
        text1 = [];
      }
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}
async function addTrackerFBScan(uid) {
  if (uid) {
    try {
      var fbtrack = await funcUser_ppt.getFBProbByUID(uid);
      if (
        fbtrack != [] &&
        fbtrack != "" &&
        fbtrack != undefined &&
        fbtrack != false &&
        fbtrack != null &&
        fbtrack.length > 0
      ) {
        await funcUser_ppt.updateTrackerProbByUID(
          fbtrack[0].id_fb,
          fbtrack[0].number_track + 1
        );
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
module.exports = {
  runFuncFile: runFuncFile,
  updateArrayClient: updateArrayClient,
};
