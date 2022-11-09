var express = require("express");
var post_md = require("../models/post");
var router = express.Router();
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: "Status: 404, Not found",
}); //giới hạn IP truy cập không quá 5 lần / 30p
router.get("/post/:id", limiter, function (req, res) {
  var data = post_md.getPostByID(req.params.id);
  data
    .then(function (posts) {
      var post = posts[0];
      var result = {
        post: post,
        error: false,
      };
      return res.render("blog/post", { data: result });
    })
    .catch(function (err) {
      var result = {
        error: "Không thể xem bài viết",
      };
      console.log(err);
      return res.render("blog/post", { data: result });
    });
});
router.get("/about", limiter, function (req, res) {
  return res.render("blog/about");
});
module.exports = router;
