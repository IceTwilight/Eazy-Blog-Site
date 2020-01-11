var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var method_override = require("method-override");
var express_sanitizer = require("express-sanitizer");

// app config
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/restful_blog");
app.set("view engine", "ejs");
app.use(express.static("public"));// for custom style sheet 
//https://expressjs.com/zh-cn/starter/static-files.html
app.use(bodyParser.urlencoded({extended: true}));
app.use(express_sanitizer());//after bodyparser
app.use(method_override("_method"))
// titel image_url body timestamp

// mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} 
});
var blogModel = mongoose.model("Blog", blogSchema);
// mongoose.model(modelName, schema)
// blogModel.create({
//     title: "TEST blog",
//     image: "https://winatweb.com/wp-content/uploads/2019/04/what-is-a-blog.png",
//     body: "First Blog"
// });

// restful routes
app.get("/", function(req, res){
    res.redirect("/blogs");
})
//Index
app.get("/blogs", function(req, res){
    blogModel.find({}, function(error, blogs){
        if (error) {
            console.log(error);
        } else {
            res.render("index", {blogs: blogs});
        }
    })
    
})

// new and create
app.get("/blogs/new", function(req, res){
    res.render("new")
});

app.post("/blogs", function(req, res){
    //create
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogModel.create(req.body.blog, function(err, newBlog){
        if (err){
            console.log(err);
        } else {
            //redirect
            res.redirect("/blogs");
        }
    });
    
});

// show
app.get("/blogs/:id", function(req, res){
    blogModel.findById(req.params.id, function(error, foundBlog){
        if (error){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    })
});

// edit route

app.get("/blogs/:id/edit", function(req, res){
    blogModel.findById(req.params.id, function(error, foundBlog){
        if (error) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    })
    
})

// update
app.put("/blogs/:id", function(req, res){
    blogModel.findByIdAndUpdate(req.params.id, req.body.blog, function(error, updatedBlog){
        if (error) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id)
        }
    });
});

//delete
app.delete("/blogs/:id", function(req, res){
    //destroy
    blogModel.findByIdAndRemove(req.params.id, function(error){
        if(error) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
    //redirect
});

app.listen(3000, function(){
    console.log("server running on port 3000");
})