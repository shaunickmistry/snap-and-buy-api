let express = require('express');
let bodyParser = require("body-parser");
let visearch = require('visearch-javascript-sdk');
let router = express.Router();

/* Here we are configuring express to use body-parser as middle-ware. */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Set up keys
visearch.set('app_key', '890640f4b381cbcb3b5cafb0b179c097');

/* Test for individual image with Visense API. */
router.get('/image-search', function(request, response, next) {
  // return res.send('POST HTTP method on user resource: ' + image);
  visearch.uploadsearch({
    im_url: "http://example.com/example.jpg",
  }, function(res) {
      response.json(res);
  }, function(err){
    /**
     *{message:"Failed to fetch"}
     **/
    response.send("Err")
  });
});

/* POST. */
router.post('/image-search', function(req, res, next) {
  let image = req.body.test;
  // return res.send('POST HTTP method on user resource: ' + image);
  visearch.uploadsearch({
    image: image,
    fl: ["im_url","price"]
  }, function(res) {
    if(res.status == "OK"){
      return res.send(res);
      // $(".main .similars").html(response_template(res));
    }else{
      // $(".main .similars").html(res.error);
    }
    // $(".submit .glyphicon").hide();
  }, function(err){
    /**
     *{message:"Failed to fetch"}
     **/
    // alert(err);
  });
});

module.exports = router;
