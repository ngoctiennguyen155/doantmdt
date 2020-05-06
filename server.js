const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongodb = require('mongoose');
const userrrrr = 'nguyentiep';
const passworddddd = 'nguyentiep';

mongodb.connect('mongodb+srv://cluster0-rgk1s.mongodb.net/test', {
  dbName: 'tmdt',
  user: userrrrr,
  pass : passworddddd,
  useNewUrlParser: true,
  useUnifiedTopology : true
}).then(() => {
  console.log('Connect database seccess !!!');
});

app.use(express.static("./public"));

app.set("views", "./views");
app.set("view engine", "ejs");
const port = 3000;
app.listen(port,console.log(`Listening on port ${port}...`));

app.get("/", function (req, res) {
     res.render("index");
})

app.get("/blog-details", function (req, res) {
  res.render("blog-details");
});

app.get("/shop-grid", function (req, res) {
  res.render("shop-grid");
});

app.get("/shoping-cart", function (req, res) {
  res.render("shoping-cart");
});

app.get("/shop-details", function (req, res) {
  res.render("shop-details");
});

app.get("/blog", function (req, res) {
  res.render("blog");
});

app.get("/checkout", function (req, res) {
  res.render("checkout");
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/index", function (req, res) {
  res.render("index");
});

app.get("/main", function (req, res) {
  res.render("main");
});



