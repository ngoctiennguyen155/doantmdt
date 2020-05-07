const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongodb = require('mongoose');
const cors = require('cors');
require('dotenv/config');

// connect mongodb 
mongodb.connect(process.env.DB_CONNECT, {
  dbName: 'tmdt',
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

const schema = require('./model/schema');
app.use(bodyParser.json());

// this middleware use to build restful api so need this line to fix 'no access control allow origin' OK
app.use(cors());
//

app.post('/', async function (req, res) {
  const Schema = new schema({
    title: req.body.title
  });

  try {
    const savetitle = await Schema.save();
    res.send(savetitle);
  } catch (err) {
    res.send(savetitle);
  }
});


app.get('/', (req, res) => {
  res.render('index');
});

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



