const URLserver=location.protocol + "//" + document.domain ;
//alert(URLserver)
var socket = io.connect(URLserver); //http://localhost:3000
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
    $("#textlink").val("");
    $("#btn-login").text("Bắt đầu");
    $("#btn-login").prop("disabled", false); //disabled nút bấm
    $("#textlink").prop("disabled", false);
    $("#list-job-running-fb").children().on("click");
  };
  $("#conversation").append(datachat.data);
  // bindEventLinkFile();
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
// socket.on("update_list_client",function(data){
//     hàm này lười quá nên không làm
//     var a_jobrunning=$('#list-job-running-fb > a');
//     $('#list-job-running-fb > a').remove();
//     $("#list-job-running-fb").append(data);
//     bindEventuser();
// });
var all_list_fb = [];
socket.on("update_list_str", function (data) {
  //sửa key lại
  // $('.li-keyfb').remove();
  // $("#textkeys").val("");
  // $("#list-keys-fb").append(data);
  $("#conversation").append(data.data); //thêm thẻ <a> có chứa dữ liệu list</a>
  all_list_fb[data.uid] = JSON.parse(data.list);
  bindEventLinkFile();
});
//send message Event/thay bằng tác vụ khác
var numcheckbtn = 0;
$("#btn-login").click(function (e) {
  e.preventDefault();
  //alert("clicked");
  //alert($("#btn-login").text())
  if ($("#btn-login").text() == "Đang thực hiện") {
    numcheckbtn++;
    if (numcheckbtn == 2) {
      $("#btn-login").prop("disabled", true); //disabled nút bấm
      numcheckbtn = 0;
    };
    socket.emit("Stop_job_str", true);
    $("#btn-login").prop("disabled", false); //disabled nút bấm
    $("#btn-login").text("Bắt đầu");
    $("#textlink").prop("disabled", false);
    // $("#list-job-running-fb").children().on( "click");
    return;
  };
  //thêm dữ liệu vào hệ thống
  //alert($("#btn-login").text())
  if ($("#btn-login").text() == "Bắt đầu") {
    var message = {
      email: $("#login-email-fb").val(),
      pass: $("#login-password-fb").val(),
      permission: $('input[name="permission"]:checked').val(),
      textlink: $("#textlink").val(),
    };
    var list_a = $("#list-job-running-fb > a");
    var data = [];
    //console.log(list_a)
    if (message.permission == 1 && list_a != undefined && list_a.length > 0) {
      for (var i = 0; i < list_a.length; i++) {
        let gr0 = Number(list_a.eq(i).attr("group_job").split("-")[1]);
        if (gr0 > 3) break;
        let data0 = new Array(
          Number(list_a.eq(i).attr("job-id").split("-")[2]),
          gr0
        );
        data.push(data0);
      };
      message.jobrunning = data;
      //console.log(message.jobrunning)
    } else {
      message.jobrunning = [];
    };
    var id_user = $("#id_user").val();
    //$("#textlink").val("");
    //alert('2')
    if (id_user.trim().length != 0) {
      //alert('socket',id_user.trim().length)
      socket.emit("send_message_str", message, id_user);
    };
    $("#btn-login").prop("disabled", false); //disabled nút bấm
    $("#btn-login").text("Đang thực hiện");
    $("#textlink").prop("disabled", true);
    // $("#list-job-running-fb").children().off( "click");
  };
});
$("#btn-keys").click(function (e) {
  var id_user = $("#id_user").val();
  var id_keys = $("#textkeys").val();
  if (id_user.trim().length != 0 && id_keys.trim().length != 0) {
    socket.emit("send_key_str", id_keys, id_user);
  };
});
$("#loginform").submit(function () {
  return false;
});
// //click enter
// $("#message").keypress(function(e){
//     if(e.which==13){
//         $("#btn-login").trigger("click");
//     };
// });
function bindEventuser() {
  $(".delete-userid").click(function (e) {
    e.preventDefault();
    var iduser = $(this).attr("us-id").split("icon-")[1];
    $("#user-" + iduser).remove();
    socket.emit("delete_user_id_str", iduser);
  });
};
function bindEventKeys() {
  $(".delete-keyid").click(function (e) {
    e.preventDefault();
    var idkey = $(this).attr("key-id").split("icon-")[1];
    $("#key-" + idkey).remove();
    socket.emit("delete_key_id_str", idkey);
  });
};
function bindEventJobs() {
  $(".delete-jobid").click(function (e) {
    e.preventDefault();
    var idjob = $(this).attr("job-id").split("job-")[1];
    $("#job-" + idjob).remove();
    //gửi vô 1 mẫu trên client
    socket.emit("delete_job_id_str", idjob);
  });
};
function bindEventLinkFile() {
  $(".linkfilelist").click(function (e) {
    e.preventDefault();
    var idLink = $(this).attr("id"); //lấy UID trong ID <a>
    //var copy ="'"+"copy"+"'";
    let params =
      "top=0,left=0,width=500,height=500,menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=1";
    let newWindow = window.open(idLink, idLink, params);
    var data = all_list_fb[idLink];
    newWindow.onload = function () {
      //<script type="text/javascript">function clickbtn(){var r=document.createRange();r.selectNode(document.getElementById(idLink));window.getSelection().removeAllRanges();window.getSelection().addRange(r);document.execCommand('+copy+');window.getSelection().removeAllRanges();};</script><div><button onclick="clickbtn()" class="'+idLink+'">Copy vào bộ nhớ tạm</button><div style="clear: both;"></div>
      if (data && data.length > 0) {
        if (typeof data == "object") {
          if (data[0] && typeof data[0] == "object") {
            //<table><tr><th></th><th></th></tr></table>
            var html = '<div id="' + idLink + '"><table>';
            for (var i = 0; i < data.length; i++) {
              for (var j = 0; j < data[i].length; j++) {
                html += "<tr><th>" + data[i][j] + "</th>";
                if (j == data[i].length - 1) {
                  html += "</tr>";
                }
              }
              if (i == data.length - 1) {
                html += "</table></div>";
              };
            };
          } else {
            var html = '<div id="' + idLink + '"><table>';
            for (var i = 0; i < data.length; i++) {
              html += "<tr><th>" + data[i] + "</th></tr>";
              if (i == data.length - 1) {
                html += "</table></div>";
              };
            };
          };
        } else {
          var html = '<div id="' + idLink + '">' + data + "</div>";
        };
      } else {
        var html = '<div id="' + idLink + '">Không tìm thấy dữ liệu.</div>';
      };
      //let html = '<div id="'+idLink+'">'+data+'</div></div>'
      newWindow.document.body.insertAdjacentHTML("afterbegin", html);
      html = "";
    };
  });
};
function PostContentUser() {
  function bindContentbox() {
    var contentbox = document.getElementById("content-box");
    var divlogin = document.getElementById("divlogin");
    $("#uidfb").change(function (e) {
      e.preventDefault();
      var uidfb = document.getElementById("uidfb");
      if (uidfb.checked == true) {
        contentbox.disabled = false;
        contentbox.style.display = "block";
        divlogin.classList.add("col-12");
        divlogin.classList.add("col-sm-3");
        divlogin.classList.add("col-md-3");
        divlogin.classList.add("col-lg-3");
        divlogin.classList.remove("col-12");
        divlogin.classList.remove("col-sm-12");
        divlogin.classList.remove("col-md-12");
        divlogin.classList.remove("col-lg-12");
        $("#textlink").prop("placeholder", "Link UID");
        $('ul[change-id="list-job-running-fb"]').prop("id", "conversation");
        $('ul[change-id="conversation"]').prop("id", "list-job-running-fb");
        if (
          $('ul[change-id="conversation"]').children() != undefined &&
          $('ul[change-id="conversation"]').children().length > 0
        )
          $('ul[change-id="conversation"]').children().remove();
        if (
          $('ul[change-id="list-job-running-fb"]').children() != undefined &&
          $('ul[change-id="list-job-running-fb"]').children().length > 0
        )
          $('ul[change-id="list-job-running-fb"]').children().remove();
        $('ul[change-id="list-job-running-fb"]').append("<li>- Hello!!!</li>");
        $('b[id="main-jobcn"]').text("Infomation");
        $('b[id="main-info"]').text("Lệnh chạy");
        hidetab();
      };
    });
    $("#vidfb").change(function (e) {
      e.preventDefault();
      var vidfb = document.getElementById("vidfb");
      if (vidfb.checked == true) {
        contentbox.disabled = true;
        contentbox.style.display = "none";
        divlogin.classList.remove("col-12");
        divlogin.classList.remove("col-sm-3");
        divlogin.classList.remove("col-md-3");
        divlogin.classList.remove("col-lg-3");
        divlogin.classList.add("col-12");
        divlogin.classList.add("col-sm-12");
        divlogin.classList.add("col-md-12");
        divlogin.classList.add("col-lg-12");
        $("#textlink").prop("placeholder", "Link Video");
        $('ul[change-id="list-job-running-fb"]').prop(
          "id",
          "list-job-running-fb"
        );
        $('ul[change-id="conversation"]').prop("id", "conversation");
        if (
          $('ul[change-id="conversation"]').children() != undefined &&
          $('ul[change-id="conversation"]').children().length > 0
        );
          $('ul[change-id="conversation"]').children().remove();
        if (
          $('ul[change-id="list-job-running-fb"]').children() != undefined &&
          $('ul[change-id="list-job-running-fb"]').children().length > 0
        );
          $('ul[change-id="list-job-running-fb"]').children().remove();
        $('ul[change-id="conversation"]').append("<li>- Hello!!!</li>");
        $('b[id="main-jobcn"]').text("Lệnh chạy");
        $('b[id="main-info"]').text("Infomation");
        hidetab();
      };
    });
  };
  bindContentbox();
};
$(document).ready(function () {
  var contentbox = document.getElementById("content-box");
  contentbox.disabled = true;
  contentbox.style.display = "none";
  new PostContentUser();
  new addEventJobFB();
  document.getElementsByClassName("container")[0].style.display = "block";
  //xóa dữ liệu có sẵn trong email,pass
  // $('#login-email-fb').val()="";
  // $('#login-password-fb').val()="";
});
var numb_group_job;
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
    };
    await $("#list-job-fb").append(a_job_FB);
    await $(".a-job-fb").click(function (e) {
      e.preventDefault();
      //kiểm tra quá số lượng
      var list_a = $("#list-job-running-fb > a");
      if (list_a != [] && numb_group_job >= 2) {
        alert(
          "Chỉ đặt tối đa 3 nhóm hàm, nhằm hạn chế tải trọng! (Máy chủ free, xin nhẹ tay)"
        );
        return;
      };
      var idjob0 = $(this).attr("job-id");
      var idjob = listjobFB(3, idjob0);
      if (idjob === false) return alert("Hàm không tồn tại!");
      var size_job = $("#list-job-running-fb > a").length || 0;
      var group_job;
      if (
        $("#list-job-running-fb > a") != "" &&
        $("#list-job-running-fb > a") != [] &&
        $("#list-job-running-fb > a").length > 0
      ) {
        numb_group_job = Number(
          $("#list-job-running-fb > a")
            .eq($("#list-job-running-fb > a").length - 1)
            .attr("group_job")
            .split("-")[1]
        );
        //alert(numb_group_job)
        if (document.getElementById("check_gr").checked == false) {
          numb_group_job++;
          group_job = "gr-" + numb_group_job;
        } else {
          group_job = "gr-" + numb_group_job;
        };
      } else {
        numb_group_job = 0;
        group_job = "gr-0";
      };

      var val_a_add =
        '<a class="a-job-running-fb badge badge-warning" group_job="' +
        group_job +
        '" id="job-' +
        (size_job + 1) +
        "-" +
        idjob +
        '" job-id="job-' +
        (size_job + 1) +
        "-" +
        idjob +
        '" style="margin:3px; border-radius: 3px; background-color: rgba(13, 202, 171, 0.856);"><b style="color:brown;">(' +
        (numb_group_job + 1) +
        ") </b>" +
        data_job[idjob0] +
        "</a>";
      $("#list-job-running-fb").append(val_a_add);
      $(".a-job-running-fb").click(function (e) {
        e.preventDefault();
        var idjobrunning = $(this).attr("job-id");
        $("#" + idjobrunning).remove();
        numb_group_job = numb_group_job - 1;
        hidetab();
      });
      hidetab();
    });
  };
  addjobFB();
};
function hidetab() {
  var a_jobrunning = $("#list-job-running-fb > a");
  // var a_Job=$("#list-job-fb > a");
  if (
    a_jobrunning !== undefined &&
    a_jobrunning != [] &&
    a_jobrunning.length > 0
  ) {
    var group_job = $("#list-job-running-fb > a")
      .eq($("#list-job-running-fb > a").length - 1)
      .attr("group_job");
    //alert('group_job' + group_job);
    var dataIndexAfder = [];
    for (var j = 0; j < $("#list-job-running-fb > a").length; j++) {
      //alert($('#list-job-running-fb > a').eq(0).attr("group_job"));
      //alert(group_job);
      if ($("#list-job-running-fb > a").eq(j).attr("group_job") == group_job) {
        //alert(listjobFB('index')[Number($('#list-job-running-fb > a').eq(j).attr("job-id").split('-')[2])]);
        dataIndexAfder.push(
          ...listjobFB("index")[
            Number(
              $("#list-job-running-fb > a").eq(j).attr("job-id").split("-")[2]
            )
          ]
        );
      };
    };

    // dataIndexAfder = new Set(dataIndexAfder);
    // console.log(dataIndexAfder);
    //var numberFN=Number(a_jobrunning.eq(a_jobrunning.length-1).attr("job-id").split('-')[2]);
    //var dataIndexAfder = listjobFB('index')[numberFN];
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
        };
      };
    };
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
        };
      };
    };
  };
};
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
    searchPagesOrgroups: "Tìm kiếm Trang/Nhóm theo từ khóa (return link, text)",
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
    data_name_job_IndexAfder[3] = new Array(4, 6);
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
  };
  if (data === "start") {
    var data_name_job_Start = new Array(1, 2, 4, 5, 6, 8, 10, 11, 12, 13, 14);
    return data_name_job_Start;
  };
  if (data === 1) {
    return data_job;
  };
  if (data === 2) {
    return data_name_job;
  };
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
  };
  return false;
};
