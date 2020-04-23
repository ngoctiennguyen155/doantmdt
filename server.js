const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static("./public"));

app.set("views", "./views");
app.set("view engine", "ejs");

app.listen(3000);

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



