$(function() {
    $("#chat-circle").click(function() {    
      $("#chat-circle").toggle('scale');
      $("#num-chat").toggle('scale');
      $(".chat-box").toggle('scale');
      $(".chat-logs").stop().animate({scrollTop: $(".chat-logs")[0].scrollHeight},1000);
    });
    $(".chat-box-toggle").click(function() {
      $("#chat-circle").toggle('scale');
      $("#num-chat").toggle('scale');
      $(".chat-box").toggle('scale');
    });
    $("#chat-input").keypress(function(e){
      if(e.which==13){
        $("#chat-submit").trigger("click");
        document.getElementById("chat-input").focus();
      };
    });
    $("#chat-submit").click(function() {    
      document.getElementById("chat-input").focus();
    });
});