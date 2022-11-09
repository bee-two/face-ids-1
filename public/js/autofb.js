const URLserver=location.protocol + "//" + document.domain ;
var socket = io.connect(URLserver); // http://localhost:3000
// nhập thông báo từ beams client
Notification.requestPermission().then(function (result) {
  if (result === "denied") {
    alert("denied");
    return;
  }
  if (result === "default") {
    //alert('ignored');
    return;
  }
  //alert('granted');
  const beamsClient = new PusherPushNotifications.Client({
    instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
  });
  beamsClient
    .start()
    .then(() =>
      beamsClient.setDeviceInterests([$("#id_user").val() + "notifi"])
    )
    .then(() => console.log("Successfully registered and subscribed!"))
    .catch(console.error);
});
socket.on("connect", function () {
  console.log("User đang kết nối Server...");
  //ask name
  var username = $("#username").val();
  var id_user = $("#id_user").val();
  socket.emit("adduser_str", username, id_user);
});

//listen update message event
socket.on("update_message_str", function (datachat) {
  if (datachat.checkbtn === false) {
    alert("Đã thêm nhiệm vụ" + $("#textname").val());
    $("#textname").val("");
  }
  $("#list-job-sv").append(datachat.data);
});
socket.on("update_account_str", function (dataaccount) {
  $(".li-userfb").remove();
  $("#list-account-fb").append(dataaccount);
  bindEventuser();
});
socket.on("add_key_str", function (datakey) {
  $(".li-keyfb").remove();
  $("#textkeys").val("");
  $("#list-keys-fb").append(datakey);
  bindEventKeys();
});
socket.on("add_time_str", function (datatime) {
  $(".li-timefb").remove();
  $("#texttime").val("");
  $("#list-time-auto").append(datatime);
  bindEventTimes();
});
var all_list_fb = [];
socket.on("update_job_client", function (data) {
  $(".li-job").remove(); // xóa thẻ cũ
  $("#textname").val("");
  $("#list-job-sv").append(data); //thêm thẻ <li> có chứa dữ liệu list</li>
  bindEventDeljob(); //gắn sự kiện nút xóa Job
  bindEventChangeCheckjob(); //gắn sự kiện thay đổi checkrun
  //all_list_fb[data.uid]=data.list;
});
socket.on("update_account_fb_danger", function (data) {
  $(".li-account-fb-danger").remove(); // xóa thẻ cũ
  $("#list-account-fb-danger").append(data); //thêm thẻ <li> có chứa dữ liệu list</li>
  bindEventAccountFBDanger(); //gắn sự kiện nút xóa facebook danger
  //all_list_fb[data.uid]=data.list;
});
//send message Event/thay bằng tác vụ khác
var numcheckbtn = 0;
$("#btn-login").click(function (e) {
  e.preventDefault();
  //thêm dữ liệu vào hệ thống
  if ($("#textname").val() == "") {
    alert("Tên không được để trống!");
    return false;
  }
  var message = {
    name: $("#textname").val(),
  };
  var list_a = $("#list-job-running-fb > a");
  var data = [];
  //console.log('list_a: ',list_a);
  if (
    list_a == [] ||
    list_a == undefined ||
    list_a == false ||
    list_a == "" ||
    list_a.length <= 0
  ) {
    alert("Chức năng không được để trống!");
    return false;
  }
  if (list_a != undefined && list_a.length > 0) {
    for (var i = 0; i < list_a.length; i++) {
      if (i > 3) break;
      let data0 = Number(list_a.eq(i).attr("job-id").split("-")[2]);
      data.push(data0);
    }
    message.listjob = data;
    //console.log(message.jobrunning)
  } else {
    message.listjob = [];
  }
  var id_user = $("#id_user").val();
  if (id_user.trim().length != 0) {
    socket.emit("send_job_sv", message, id_user);
  }
});
$("#btn-keys").click(function (e) {
  var id_user = $("#id_user").val();
  var id_keys = $("#textkeys").val();
  if (id_user.trim().length != 0 && id_keys.trim().length != 0) {
    socket.emit("send_key_str", id_keys, id_user);
  }
});
$("#btn-time").click(function (e) {
  var id_user = $("#id_user").val();
  var id_time = $("#texttime").val(); // chuyển thành giờ
  //alert (typeof (id_time));
  if (id_user.trim().length != 0 && id_time.trim().length != 0) {
    socket.emit("send_time_str", id_time, id_user);
    //API
  }
});
$("#loginform").submit(function () {
  return false;
});
function bindEventuser() {
  $(".delete-userid").click(function (e) {
    e.preventDefault();
    var iduser = $(this).attr("us-id").split("icon-")[1];
    $("#user-" + iduser).remove();
    socket.emit("delete_user_id_str", iduser);
  });
}
function bindEventAccountFBDanger() {
  $(".delete-accountfbdanger").click(function (e) {
    e.preventDefault();
    var id = $(this).attr("id").split("dg-")[1];
    $("#dgli-" + id).remove();
    socket.emit("delete_account_fb_danger", id);
  });
}
function bindEventKeys() {
  $(".delete-keyid").click(function (e) {
    e.preventDefault();
    var idkey = $(this).attr("key-id").split("icon-")[1];
    $("#key-" + idkey).remove();
    socket.emit("delete_key_id_str", idkey);
  });
}
function bindEventTimes() {
  $(".delete-timeid").click(function (e) {
    e.preventDefault();
    var id = $(this).attr("id").split("timeicon-")[1];
    $("#time-" + id).remove();
    socket.emit("delete_time_id_str", id);
  });
}
function bindEventJobs() {
  $(".delete-jobid").click(function (e) {
    e.preventDefault();
    var idjob = $(this).attr("job-id").split("job-")[1];
    $("#job-" + idjob).remove();
    //gửi vô 1 mẫu trên client
    socket.emit("delete_job_id_str", idjob);
  });
}
function bindEventDeljob() {
  $(".delete-jobsv").click(function (e) {
    e.preventDefault();
    var idjob = $(this).attr("id").split("btn-job-")[1];
    $("#jobsv-" + idjob).remove();
    //gửi vô 1 mẫu trên client
    socket.emit("delete_job_sv", idjob);
  });
}
function bindEventChangeCheckjob() {
  $(".check-job-ip").change(function (e) {
    e.preventDefault();
    var Chxjob = $(this).attr("id");
    var id = Chxjob.split("job-ip-")[1]; //id của job đang chọn
    var checkboxJob = document.getElementById(Chxjob);
    var change;
    //thêm dữ liệu lên server
    if (checkboxJob.checked === true) {
      change = 2;
    } else {
      change = 1;
    }
    socket.emit("change_checkjob_sv", id, change);
  });
}
function bindEventChangeHide() {
  document.getElementById("check_gr_auto").checked = false;
  var ClsCheck = document.getElementsByClassName("hide_cls_check");
  for (var i = 0; i < ClsCheck.length; i++) {
    //alert(ClsCheck.length)
    ClsCheck[i].style.display = "none";
  }
  var divmain = document.getElementById("divmain");
  var divmain1 = document.getElementById("divmain1");
  divmain.classList.add("col-12");
  divmain.classList.add("col-sm-12");
  divmain.classList.add("col-md-12");
  divmain.classList.add("col-lg-12");
  divmain.classList.remove("col-sm-9");
  divmain.classList.remove("col-md-9");
  divmain.classList.remove("col-lg-9");
  //
  divmain1.classList.remove("col-9");
  divmain1.classList.remove("col-sm-8");
  divmain1.classList.remove("col-md-8");
  divmain1.classList.remove("col-lg-9");
  divmain1.classList.add("col-12");
  divmain1.classList.add("col-sm-12");
  divmain1.classList.add("col-md-12");
  divmain1.classList.add("col-lg-12");
  $("#check_gr_auto").change(function (e) {
    e.preventDefault();
    var Chxjob = $(this).attr("id");
    var checkboxJob = document.getElementById(Chxjob);
    var ClsCheck = document.getElementsByClassName("hide_cls_check");
    //alert('click check')
    //thêm dữ liệu lên server
    if (checkboxJob.checked === true) {
      //alert('click check')
      //hiển thị các phần tử lên
      for (var i = 0; i < ClsCheck.length; i++) {
        ClsCheck[i].style.display = "block";
      }
      // var divmain = document.getElementById('divmain');
      // var divmain1 = document.getElementById('divmain1');
      divmain.classList.add("col-12");
      divmain.classList.add("col-sm-9");
      divmain.classList.add("col-md-9");
      divmain.classList.add("col-lg-9");
      divmain.classList.remove("col-sm-12");
      divmain.classList.remove("col-md-12");
      divmain.classList.remove("col-lg-12");
      //
      divmain1.classList.add("col-9");
      divmain1.classList.add("col-sm-8");
      divmain1.classList.add("col-md-8");
      divmain1.classList.add("col-lg-9");
      divmain1.classList.remove("col-12");
      divmain1.classList.remove("col-sm-12");
      divmain1.classList.remove("col-md-12");
      divmain1.classList.remove("col-lg-12");
    } else {
      for (var i = 0; i < ClsCheck.length; i++) {
        ClsCheck[i].style.display = "none";
      }
      // var divmain= document.getElementById('divmain');
      // var divmain1 = document.getElementById('divmain1');
      divmain.classList.add("col-12");
      divmain.classList.add("col-sm-12");
      divmain.classList.add("col-md-12");
      divmain.classList.add("col-lg-12");
      divmain.classList.remove("col-sm-9");
      divmain.classList.remove("col-md-9");
      divmain.classList.remove("col-lg-9");
      //
      divmain1.classList.remove("col-9");
      divmain1.classList.remove("col-sm-8");
      divmain1.classList.remove("col-md-8");
      divmain1.classList.remove("col-lg-9");
      divmain1.classList.add("col-12");
      divmain1.classList.add("col-sm-12");
      divmain1.classList.add("col-md-12");
      divmain1.classList.add("col-lg-12");
    }
  });
}
$(document).ready(function () {
  bindEventChangeHide(); //ẩn cá tab khoog cần thiết
  new addEventJobFB();
  bindEventDeljob(); //gắn sự kiện nút xóa Job
  bindEventChangeCheckjob(); //gắn sự kiện thay đổi checkrun
  document.getElementsByClassName("container")[0].style.display = "block";
});
function addEventJobFB() {
  async function addjobFB() {
    var data_job = listjobFB(1);
    var data_name_job = listjobFB(2);
    var a_job_FB = "";
    for (var i = 0; i < data_name_job.length; i++) {
      a_job_FB +=
        '<a class="a-job-fb badge badge-warning" id="' +
        data_name_job[i] +
        '" job-id="' +
        data_name_job[i] +
        '" style="margin:3px; border-radius: 3px; background-color: rgba(13, 202, 171, 0.856);">' +
        data_job[data_name_job[i]] +
        "</a>";
    }
    await $("#list-job-fb").append(a_job_FB);
    await $(".a-job-fb").click(function (e) {
      e.preventDefault();
      //kiểm tra quá số lượng
      var list_a = $("#list-job-running-fb > a");
      // if (list_a!=[] && list_a.length>=3) {
      //     alert ("Chỉ đặt tối đa 3 hàm, nhằm hạn chế tải trọng! (Máy chủ free, xin nhẹ tay)");
      //     return;
      // };
      var idjob0 = $(this).attr("job-id");
      var idjob = listjobFB(3, idjob0);
      if (idjob === false) return alert("Hàm không tồn tại!");
      var size_job = $("#list-job-running-fb > a").length || 0;
      var val_a_add =
        '<a class="a-job-running-fb badge badge-warning" id="job-' +
        (size_job + 1) +
        "-" +
        idjob +
        '" job-id="job-' +
        (size_job + 1) +
        "-" +
        idjob +
        '" style="margin:3px; border-radius: 3px; background-color: rgba(13, 202, 171, 0.856);"><b style="color:brown;">(' +
        (size_job + 1) +
        ") </b>" +
        data_job[idjob0] +
        "</a>";
      $("#list-job-running-fb").append(val_a_add);
      $(".a-job-running-fb").click(function (e) {
        e.preventDefault();
        var idjobrunning = $(this).attr("job-id");
        $("#" + idjobrunning).remove();
        hidetab();
      });
      hidetab();
    });
  }
  addjobFB();
}
function hidetab() {
  var a_jobrunning = $("#list-job-running-fb > a");
  // var a_Job=$("#list-job-fb > a");
  if (
    a_jobrunning !== undefined &&
    a_jobrunning != [] &&
    a_jobrunning.length > 0
  ) {
    var numberFN = Number(
      a_jobrunning
        .eq(a_jobrunning.length - 1)
        .attr("job-id")
        .split("-")[2]
    );
    var dataIndexAfder = listjobFB("index")[numberFN];
    //console.log('a_Job = ',a_Job.length)
    if (
      $("#list-job-fb > a") !== undefined &&
      $("#list-job-fb > a") != [] &&
      $("#list-job-fb > a").length > 0
    ) {
      for (var i = 0; i < $("#list-job-fb > a").length; i++) {
        var job_id = $("#list-job-fb > a").eq(i).attr("job-id");
        var arrIndex = listjobFB(2).indexOf(job_id);
        if (dataIndexAfder.indexOf(arrIndex) == -1) {
          document.getElementById(job_id).style.display = "none";
        } else {
          document.getElementById(job_id).style.display = "";
        }
      }
    }
  } else {
    for (var i = 0; i < $("#list-job-fb > a").length; i++) {
      // $("#list-job-fb > a").eq(i).on("click");
      // document.getElementById($("#list-job-fb > a").eq(i).attr("job-id")).style.display="";
      var dataStart = listjobFB("start");
      for (var i = 0; i < $("#list-job-fb > a").length; i++) {
        var job_id = $("#list-job-fb > a").eq(i).attr("job-id");
        var arrIndex = listjobFB(2).indexOf(job_id);
        if (dataStart.indexOf(arrIndex) == -1) {
          document.getElementById(job_id).style.display = "none";
        } else {
          document.getElementById(job_id).style.display = "";
        }
      }
    }
  }
}
//Danh sách các function tác vụ trên FB
function listjobFB(data, job) {
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
    searchPagesOrgroups: "Tìm kiếm Trang/Nhóm theo từ khóa (return link, text)",
    searchSTTContents:
      "Tìm kiếm bài viết theo từ khóa FB-Danger (return link, text)",
    getContentsLikeCmtShare: "Lấy người Like, Cmt, Share (return UID)",
    searchSTTContentsinUID:
      "Tìm kiếm bài viết chứa từ khóa FB-Danger trong UID (return UID, text)",
    getSubGroupsOGroups: "Nhóm nhỏ trong Nhóm (return UID, text)",
  };
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
  if (data === "start") {
    var data_name_job_Start = new Array(1, 2, 4, 5, 6, 8, 10, 11, 12, 13, 14);
    return data_name_job_Start;
  }
  if (data === 1) {
    return data_job;
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
  return false;
}
