function User(){
    function bindEvent(){
        $(".update_user").click(
            function(e){
               //var txtContent = document.getElementsById("content");
            var params= {
                id: $(".id").val(),
                password: $(".password").val(),
                repassword: $(".repassword").val(),
               //content: tinymce.get("content").getContent(),
                //content: txtContent.value,
                last_name: $(".lastname").val()
            };

            var base_url = location.protocol + "//" + document.domain + ":" + location.port;
            $.ajax({
                url: base_url + "/admin/updateuser",
                type: "PUT",
                data: params,
                dataType: "json",
                success: function(res){
                    if (res && res.status_code==200){
                        location.reload();
                    }
                }
            });

        });
         $(".user_delete").click(function(e){
             var user_id = $(this).attr("user_id");
             var base_url = location.protocol + "//" + document.domain + ":" + location.port;
             $.ajax({
                 url: base_url + "/admin/delete",
                 type: "DELETE",
                 data: {id:user_id},
                 dataType: "json",
                 success: function(res){
                     if (res && res.status_code==200){
                         location.reload();
                     }
                 }
             });
         });
    }
    bindEvent();
}

$(document).ready(function(){
    new User();
})