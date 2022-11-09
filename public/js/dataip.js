function Post(){
    function bindEvent(){

        $(".post_delete").click(function(e){
            var post_id = $(this).attr("post_id");
            var base_url = location.protocol + "//" + document.domain + ":" + location.port;
            $.ajax({
                url: base_url + "/data/delete",
                type: "DELETE",
                data: {id:post_id},
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

