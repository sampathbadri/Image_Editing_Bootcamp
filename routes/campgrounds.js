var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var request = require("request");





router.get("/", function(req, res){
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
           request('https://maps.googleapis.com/maps/api/geocode/json?address=sardine%20lake%20ca&key=AIzaSyBtHyZ049G_pjzIXDKsJJB5zMohfN67llM', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body); 
                res.render("campgrounds/index",{campgrounds:allCampgrounds});

            }
});
       }
    });
});



router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var file = req.body.file;
    var desc = req.body.description;
	var taskname = req.body.taskname;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, file: file, description: desc, taskname:taskname , author:author}
	
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log("This error");
        } else {
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});


router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});


router.get("/:id", function(req, res){

    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

router.get("/:id/edit", middleware.checkUserCampground, function(req, res){
    console.log("IN EDIT!");

    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        } else {

            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

router.put("/:id", function(req, res){
    var newData = {name: req.body.name, image: req.body.image, description: req.body.desc};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});


module.exports = router;