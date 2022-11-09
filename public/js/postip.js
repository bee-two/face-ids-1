function Post(){
    function bindEvent(){

        $(".post_delete").click(function(e){
            var post_id = $(this).attr("post_id");
            var post_title = $(this).attr("post_title");
            var base_url = location.protocol + "//" + document.domain + ":" + location.port;
            $.ajax({
                url: base_url + "/track/delete",
                type: "DELETE",
                data: {
                        id: post_id,
                        title: post_title
                        },
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
    new Post();
});

const URLserver=location.protocol + "//" + document.domain;
        var p_url_server =  document.getElementsByClassName('urlserver');
        if (p_url_server && p_url_server.length>0) {
            for (let i = 0; i < p_url_server.length;i++) {
              p_url_server[i].textContent=URLserver + p_url_server[i].textContent;
            };
        };