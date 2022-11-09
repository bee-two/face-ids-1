//angular
var app = angular.module("app.todos", ["xeditable"]);
const URLserver=location.protocol + "//" + document.domain ;
app.run(function (editableOptions) {
  editableOptions.theme = "bs3";
});

app.controller("todoController", [
  "$scope",
  "svTodos",
  "$filter",
  function ($scope, svTodos, $filter) {
    var now = new Date();
    var nowTimes = "T17:00:00+07:00";
    var delaydate = 36 * 60 * 60 * 1000;
    $scope.appName = "Đầu việc: ";
    $scope.appNamelate = "Trễ: ";
    $scope.formData = [];
    $scope.formData.user_name = "Tất cả (All)";
    $scope.loading = true;
    $scope.countcurrent = 0;
    $scope.idIndex_user = "";
    $scope.countlate = 0;
    $scope.todos = [];
    // $scope.valnotifi;
    var filter = [];
    // var filterchats=[];
    var messdatas = [];
    // var datatoken=[];
    $scope.formData.id_user = "";
    // messdatas.re_name="Tất cả (All)";
    messdatas.re_user = 0;
    $scope.messform = [];
    var listusers = [];
    //load data from api

    if (Notification.permission === "denied") {
      $scope.valnotifi = " (Thông báo bị chặn)";
    } else if (Notification.permission === "default") {
      $scope.valnotifi = " (Ấn bật Thông báo)";
    } else {
      $scope.valnotifi = "";
    }

    svTodos.get("/nodetodo").then(function (data) {
      //socket
      var countcurrent = 0;
      var countlate = 0;
      $scope.todos = data.data.data;
      listusers = data.data.listusers;
      for (var i = 0; i < $scope.todos.length; i++) {
        var datadate = new Date($scope.todos[i].end_at + nowTimes);
        $scope.todos[i].end_at = datadate;
        // $scope.todos[i].end_attext=$filter('date')(datadate, 'dd/MM/yyyy');
        var datadatedemo = new Date($scope.todos[i].end_atdemo + nowTimes);
        $scope.todos[i].end_atdemo = datadatedemo;
        if ($scope.todos[i].isDone == 1) {
          $scope.todos[i].isDone = true;
        } else {
          $scope.todos[i].isDone = false;
        }

        // data.data.data[i].end_at=$filter('date')(datenow, 'dd/MM/yyyy');
        // };
        var endday = $filter("date")(datadate, "yyyy-MM-dd");
        var enddemo = $filter("date")(datadatedemo, "yyyy-MM-dd");
        // // console.log(data.data.data[0].end_at);
        // for (var i=0; i <  $scope.todos.length; i++){
        if (datadate.getTime() - now.getTime() > delaydate) {
          $scope.todos[i].timeline = 1;
        } else if (
          datadate.getTime() - now.getTime() <= delaydate &&
          datadate.getTime() - now.getTime() > 0
        ) {
          $scope.todos[i].timeline = 2;
        } else {
          $scope.todos[i].timeline = 3;
        }

        if (endday == enddemo) {
          $scope.todos[i].updatetime = false;
        } else {
          $scope.todos[i].updatetime = true;
        }

        if ($scope.todos[i].text_job == $scope.todos[i].text_jobdemo) {
          $scope.todos[i].updatetext = false;
        } else {
          $scope.todos[i].updatetext = true;
        }
        if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
          countlate++;
        }
      }
      //console.log($scope.todos);

      //đếm số lượng công việc hiện hành
      for (var i = 0; i < $scope.todos.length; i++) {
        if ($scope.todos[i].isDone == 0) {
          countcurrent++;
        }
      }

      $scope.formData.trackper = data.data.user.trackper;
      if ($scope.formData.trackper == 2) {
        //     $scope.formData.user_name=document.getElementById("idusers").innerText
        // } else {
        $scope.formData.user_name = data.data.user.user_name;
        $scope.formData.id_user = data.data.user.id_user;
        messdatas.id_user = data.data.user.id_user;
      }
      //  else if  ($scope.formData.trackper==1){
      //     $scope.formData.id_user=51296;
      // };
      $scope.todos.sort(function (a, b) {
        return a.end_at - b.end_at;
      });
      $scope.todos.sort(function (a, b) {
        return a.isDone - b.isDone;
      });
      $scope.countcurrent = countcurrent;
      $scope.countlate = countlate;
      // $scope.countisDone = countisDonearr.filter((i)=>{i == 0}).length;
      //alert(data);
      filter = $scope.todos;
      $scope.loading = false;
      //console.log($scope.todos);

      $scope.idIndex_user = data.data.user.id_user;
      messdatas.user_name = data.data.user.user_name;
      // console.log(messdatas);
      // console.log(data.data.user);
      //socket login
      for (var i = 0; i < data.data.datachat.length; i++) {
        data.data.datachat[i].created_at = new Date(
          data.data.datachat[i].created_at
        );
        for (var j = 0; j < listusers.length; j++) {
          if (listusers[j].id == data.data.datachat[i].id_user) {
            data.data.datachat[i].user_name = listusers[j].last_name;
            break;
          }
        }
      }

      data.data.datachat.sort(function (a, b) {
        return a.created_at - b.created_at;
      });
      $scope.messform = data.data.datachat;
      if ($scope.formData.trackper == 1) {
        var idNotif = 51296;
      } else {
        var idNotif = $scope.idIndex_user;
      }
      Notification.requestPermission().then(function (result) {
        if (result === "denied") {
          //alert('denied');
          $scope.valnotifi = " (Thông báo bị chặn)";
          $scope.$digest();
          return;
        }
        if (result === "default") {
          //alert('ignored');
          $scope.valnotifi = " (Ấn bật Thông báo)";
          $scope.$digest();
          return;
        }
        //alert('granted');
        $scope.valnotifi = "";
        $scope.$digest();
        const beamsClient = new PusherPushNotifications.Client({
          instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
        });
        beamsClient
          .start()
          .then(() => beamsClient.setDeviceInterests([idNotif + "notifi"]))
          .then(() => console.log("Successfully registered and subscribed!"))
          .catch(console.error);
      });
    });
    $scope.notifica = function () {
      if ($scope.formData.trackper == 1) {
        var idNotif = 51296;
      } else {
        var idNotif = $scope.idIndex_user;
      }
      Notification.requestPermission().then(function (result) {
        if (result === "denied") {
          //alert('denied');
          $scope.valnotifi = " (Thông báo bị chặn)";
          $scope.$digest();
          return;
        }
        if (result === "default") {
          //alert('ignored');
          $scope.valnotifi = " (Ấn bật Thông báo)";
          $scope.$digest();
          return;
        }
        //alert('granted');
        $scope.valnotifi = "";
        $scope.$digest();
        const beamsClient = new PusherPushNotifications.Client({
          instanceId: "1ad6e826-a519-432f-8201-04bf8b1bcc7b",
        });
        beamsClient
          .start()
          .then(() => beamsClient.setDeviceInterests([idNotif + "notifi"]))
          .then(() => console.log("Successfully registered and subscribed!"))
          .catch(console.error);
      });
    };
    var socket = io.connect(URLserver); //http://localhost:3000 https://face-ids.herokuapp.com
    socket.on("connect", function () {
      //ask name
      var username = messdatas.user_name;
      var id_user = $scope.idIndex_user;
      var trackper = $scope.formData.trackper;
      socket.emit("adduser", username, id_user, trackper);
      console.log(username + " đã kết nối Server...");
    });
    socket.on("update_message", function (datachat) {
      // filterchats.push(datachat);
      $scope.messform.push(datachat);
      $scope.$digest();
      $(".chat-logs")
        .stop()
        .animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    });

    $scope.filterTodo = function () {
      $scope.loading = true;
      // alert($scope.formData.id_user);
      if ($scope.formData.trackper == 1) {
        // svTodos.get("/nodetodo").then(function(data){
        //     $scope.todos= data.data.data;
        // });
        var NamefilterUs = document.getElementById("idusers");
        var textUser = NamefilterUs.options[NamefilterUs.selectedIndex].text;
        // $scope.formData.id_user
        $scope.formData.user_name = textUser;
        // $scope.formData.id_user = Number(NamefilterUs.value);
        if (
          $scope.formData.id_user == "" ||
          $scope.formData.id_user == null ||
          $scope.formData.id_user == undefined
        ) {
          messdatas.re_user = 0;
        } else {
          messdatas.re_user = Number($scope.formData.id_user);
        }
        var countlate = 0;
        var countcurrent = 0;
        $scope.messform = [];
        if (messdatas.re_user != 51296 && messdatas.re_user != 0) {
          var arrfilter = filter;
          $scope.todos = [];
          for (var i = 0; i < arrfilter.length; i++) {
            if (
              Number(arrfilter[i].id_user) === Number($scope.formData.id_user)
            ) {
              $scope.todos.push(arrfilter[i]);
              if (
                new Date(arrfilter[i].end_at + nowTimes) < now &&
                arrfilter[i].isDone == 0
              ) {
                countlate++;
              }
              if (arrfilter[i].isDone == 0) {
                countcurrent++;
              }
            }
          }
          var idchat = messdatas.re_user;
          svTodos
            .getchat([idchat])
            .then(function (data) {
              for (var i = 0; i < data.data.length; i++) {
                data.data[i].created_at = new Date(data.data[i].created_at);
                for (var j = 0; j < listusers.length; j++) {
                  if (listusers[j].id == data.data[i].id_user) {
                    data.data[i].user_name = listusers[j].last_name;
                    break;
                  }
                }
              }
              data.data.sort(function (a, b) {
                return a.created_at - b.created_at;
              });
              $scope.messform = data.data;
            })
            .catch(function (err) {
              console.log(err);
            });
        } else {
          $scope.todos = filter;
          var idchat = messdatas.re_user;
          svTodos
            .getchat([idchat])
            .then(function (data) {
              for (var i = 0; i < data.data.length; i++) {
                data.data[i].created_at = new Date(data.data[i].created_at);
                for (var j = 0; j < listusers.length; j++) {
                  if (listusers[j].id == data.data[i].id_user) {
                    data.data[i].user_name = listusers[j].last_name;
                    break;
                  }
                }
              }
              data.data.sort(function (a, b) {
                return a.created_at - b.created_at;
              });
              $scope.messform = data.data;
            })
            .catch(function (err) {
              console.log(err);
            });
          for (var i = 0; i < $scope.todos.length; i++) {
            if ($scope.todos[i].isDone == 0) {
              countcurrent++;
            }
            if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
              countlate++;
            }
          }
        }
        // $scope.todos=arrfilter;

        //đếm số lượng công việc hiện hành
        $scope.todos.sort(function (a, b) {
          return a.end_at - b.end_at;
        });
        $scope.todos.sort(function (a, b) {
          return a.isDone - b.isDone;
        });
        $scope.countcurrent = countcurrent;
        $scope.countlate = countlate;

        // $scope.countisDone = countisDonearr.filter((i)=>{i == 0}).length;
        //alert(data);
      }
      $scope.loading = false;
      // alert($scope.formData.id_user);
      $(".chat-logs")
        .stop()
        .animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
    };
    $scope.createTodo = function () {
      $scope.loading = true;
      //console.log(todo);
      if (
        !$scope.formData.text_job ||
        !$scope.formData.end_at ||
        !$scope.formData.user_name ||
        $scope.formData.id_user == "51296" ||
        $scope.formData.id_user == ""
      ) {
        alert("Bạn chưa nhập nội dung hoặc ngày hoặc người thực hiện?");
      } else {
        //alert("tới đây");
        var todo = {
          id_user: Number($scope.formData.id_user),
          user_name: $scope.formData.user_name,
          text_job: $scope.formData.text_job,
          created_at: $filter("date")(new Date(), "yyyy-MM-dd"),
          end_at: $filter("date")($scope.formData.end_at, "yyyy-MM-dd"),
          trackper: $scope.formData.trackper,
          isDone: false,
        };
        svTodos
          .create(todo)
          .then(function (data) {
            var datadate = new Date(data.data.end_at + nowTimes);
            data.data.end_at = datadate;
            var datadatedemo = new Date(data.data.end_atdemo + nowTimes);
            data.data.end_atdemo = datadatedemo;
            // data.data.end_attext=$filter('date')(datadate, 'dd/MM/yyyy');
            if (datadate.getTime() - now.getTime() > delaydate) {
              data.data.timeline = 1;
            } else if (
              datadate.getTime() - now.getTime() <= delaydate &&
              datadate.getTime() - now.getTime() > 0
            ) {
              data.data.timeline = 2;
            } else {
              data.data.timeline = 3;
            }
            data.data.updatetime = false;
            data.data.updatetext = false;
            if ($scope.formData.trackper == 1) {
              filter.push(data.data);
            }

            $scope.todos.push(data.data);
            $scope.todos.sort(function (a, b) {
              return a.end_at - b.end_at;
            });
            $scope.todos.sort(function (a, b) {
              return a.isDone - b.isDone;
            });

            //đếm số lượng công việc hiện hành
            // var countisDonearr=$scope.todos;
            var countcurrent = 0;
            var countlate = 0;
            for (var i = 0; i < $scope.todos.length; i++) {
              if ($scope.todos[i].isDone == 0) {
                countcurrent++;
              }
              if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
                countlate++;
              }
            }
            $scope.countcurrent = countcurrent;
            $scope.countlate = countlate;

            //console.log(data.data);
            $scope.formData.text_job = "";
            $scope.formData.end_at = "";
            $scope.loading = false;
          })
          .catch(function (err) {
            $scope.loading = false;
            //alert("Nội dung không được upload lên CSDL");
            console.log(err);
            // res.json({status_code:500});
          });
      }
    };
    $scope.updateTodo = function (todo) {
      $scope.loading = true;
      if ($scope.formData.trackper == 2) {
        var nowdaya = todo.end_at;
        todo.end_at = $filter("date")(nowdaya, "yyyy-MM-dd");
        var nowdaydemoa = todo.end_atdemo;
        todo.end_atdemo = $filter("date")(nowdaydemoa, "yyyy-MM-dd");
        todo.job_num = 2;
        //console.log(todo);
        svTodos
          .update(todo)
          .then(function (data) {
            //$scope.todos=data.data;
            // var now = new Date();
            var nowdayb = new Date(todo.end_at + nowTimes);
            todo.end_at = nowdayb;
            // todo.end_attext=$filter('date')(nowdayb, 'dd/MM/yyyy');
            var datadatedemo = new Date(todo.end_atdemo + nowTimes);
            todo.end_atdemo = datadatedemo;
            var todoend_at = $filter("date")(todo.end_at, "yyyy-MM-dd");
            var todoend_atdemo = $filter("date")(todo.end_atdemo, "yyyy-MM-dd");
            if (nowdayb.getTime() - now.getTime() > delaydate) {
              todo.timeline = 1;
            } else if (
              nowdayb.getTime() - now.getTime() <= delaydate &&
              nowdayb.getTime() - now.getTime() > 0
            ) {
              todo.timeline = 2;
            } else {
              todo.timeline = 3;
            }
            if (todoend_at == todoend_atdemo) {
              todo.updatetime = false;
            } else {
              todo.updatetime = true;
            }
            if (todo.text_job == todo.text_jobdemo) {
              todo.updatetext = false;
            } else {
              todo.updatetext = true;
            }
            $scope.todos.sort(function (a, b) {
              return a.end_at - b.end_at;
            });
            $scope.todos.sort(function (a, b) {
              return a.isDone - b.isDone;
            });

            //đếm số lượng công việc hiện hành
            // var countisDonearr=$scope.todos;
            var countcurrent = 0;
            var countlate = 0;
            for (var i = 0; i < $scope.todos.length; i++) {
              if ($scope.todos[i].isDone == 0) {
                countcurrent++;
              }
              if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
                countlate++;
              }
            }
            $scope.countcurrent = countcurrent;
            $scope.countlate = countlate;

            $scope.loading = false;
            //alert("Yêu cầu đã được chuyển tới Admin");
          })
          .catch(function (err) {
            $scope.loading = false;
            alert("Nội dung không được upload lên CSDL");
            console.log(err);
            // res.json({status_code:500});
          });
      } else if ($scope.formData.trackper == 1) {
        var nowdaya = todo.end_atdemo;
        todo.end_at = $filter("date")(nowdaya, "yyyy-MM-dd");
        todo.end_atdemo = $filter("date")(nowdaya, "yyyy-MM-dd");
        todo.job_num = 1;
        if (todo.isDone == false) {
          todo.end_atreal = null;
        }
        //console.log(todo);
        svTodos
          .update(todo)
          .then(function (data) {
            //$scope.todos=data.data;
            // var now = new Date();
            var nowdayb = new Date(todo.end_atdemo + nowTimes);
            todo.end_at = nowdayb;
            todo.end_atdemo = nowdayb;
            //todo.end_attext=$filter('date')(nowdayb, 'dd/MM/yyyy');
            if (nowdayb.getTime() - now.getTime() > delaydate) {
              todo.timeline = 1;
            } else if (
              nowdayb.getTime() - now.getTime() <= delaydate &&
              nowdayb.getTime() - now.getTime() > 0
            ) {
              todo.timeline = 2;
            } else {
              todo.timeline = 3;
            }
            todo.updatetime = false;
            todo.updatetext = false;
            todo.text_job = todo.text_jobdemo;
            $scope.todos.sort(function (a, b) {
              return a.end_at - b.end_at;
            });
            $scope.todos.sort(function (a, b) {
              return a.isDone - b.isDone;
            });
            //đếm số lượng công việc hiện hành
            // var countisDonearr=$scope.todos;
            var countcurrent = 0;
            var countlate = 0;
            for (var i = 0; i < $scope.todos.length; i++) {
              if ($scope.todos[i].isDone == 0) {
                countcurrent++;
              }
              if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
                countlate++;
              }
            }
            $scope.countcurrent = countcurrent;
            $scope.countlate = countlate;

            $scope.loading = false;
          })
          .catch(function (err) {
            $scope.loading = false;
            alert("Nội dung không được upload lên CSDL");
            console.log(err);
          });
      }
    };
    $scope.updateTodoFN = function (todo) {
      $scope.loading = true;

      var params = {
        isDone: todo.isDone,
        // text_jobdemo: todo.text_jobdemo,
        // end_atdemo: todo.end_atdemo,
        id: todo.id,
        id_user: todo.id_user,
      };
      if ($scope.formData.trackper == 1 && todo.isDone == true) {
        params.end_atreal = $filter("date")(now, "yyyy-MM-dd");
      } else {
        params.end_atreal = null;
      }
      if ($scope.formData.trackper == 1) {
        params.job_num = 1;
        todo.isDonedemo = params.isDone;
      } else if ($scope.formData.trackper == 2) {
        params.job_num = 2;
      }
      //  alert(params.id_user);
      svTodos
        .updateFn(params)
        .then(function (data) {
          //đếm số lượng công việc hiện hành
          // var countisDonearr=$scope.todos;
          var countcurrent = 0;
          var countlate = 0;
          for (var i = 0; i < $scope.todos.length; i++) {
            if ($scope.todos[i].isDone == 0) {
              countcurrent++;
            }
            if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
              countlate++;
            }
          }
          $scope.countcurrent = countcurrent;
          $scope.countlate = countlate;

          $scope.loading = false;
        })
        .catch(function (err) {
          $scope.loading = false;
          alert("Nội dung không được upload lên CSDL");
          console.log(err);
        });
    };
    $scope.deleteTodo = function (todo) {
      //alert(id)

      $scope.loading = true;
      var delId = { id: todo.id };
      //alert(delId);
      //console.log(todo);
      svTodos
        .delete(delId)
        .then(function (data) {
          //console.log(todo);

          //console.log($scope.todos);
          console.log("Đã xóa ID: " + delId.id);
        })
        .catch(function (err) {
          alert("Nội dung không được upload lên CSDL");
          console.log(err);
          // res.json({status_code:500});
        });

      for (var i = 0; i < $scope.todos.length; i++) {
        if ($scope.todos[i].id == delId.id) {
          $scope.todos.splice(i, 1);
        }
      }
      for (var i = 0; i < filter.length; i++) {
        if (filter.id == delId.id) {
          filter.splice(i, 1);
        }
      }
      var countcurrent = 0;
      var countlate = 0;
      for (var i = 0; i < $scope.todos.length; i++) {
        if ($scope.todos[i].isDone == 0) {
          countcurrent++;
        }
        if ($scope.todos[i].end_at < now && $scope.todos[i].isDone == 0) {
          countlate++;
        }
      }
      $scope.countcurrent = countcurrent;
      $scope.countlate = countlate;
      $scope.loading = false;
    };

    $scope.message_todos = function () {
      if (document.getElementById("chat-input").value.trim() == "") {
        return false;
      }

      //generate_message(msg, 'self');
      //dữ liệu đẩy vào chat
      var messdata = {
        id_user: $scope.idIndex_user,
        user_name: messdatas.user_name,
        trackper: $scope.formData.trackper,
        created_at: $filter("date")(new Date(), "yyyy-MM-ddThh:mm:ss+07:00"),
        msg: $scope.messdata.msg,
        // re_name: messdatas.re_name
      };
      if ($scope.formData.trackper == 1) {
        messdata.re_user = messdatas.re_user;
        // filterchats.push(messdata);
      } else {
        messdata.re_user = 51296;
      }
      $(".chat-logs")
        .stop()
        .animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
      delete $scope.messdata.msg;
      // delete messdatas.re_user;
      $(".emojionearea-editor").text("");
      // delete messdatas.re_name;
      //them tin nhan vao socket
      socket.emit("send_message", messdata);
      // filterchats.push(messdata);
    };
  },
]);
