const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const mongodb = require('mongoose');
const cors = require('cors');
require('dotenv/config');

// connect mongodb
mongodb
  .connect(process.env.DB_CONNECT, {
    dbName: 'tmdt',
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connect database seccess !!!');
  });

app.use(express.static('./public'));

app.set('views', './views');
app.set('view engine', 'ejs');
const port = 3000;
app.listen(port, console.log(`Listening on port ${port}...`));

const schema = require('./model/schema');
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// this middleware use to build restful api so need this line to fix 'no access control allow origin' OK
app.use(cors());
//
// const dssanpham = require('./model/sanpham');
// app.post('/', async function (req, res) {
//   const sp = new dssanpham({
//     tensp: req.body.tensp,
//     fileanh: req.body.fileanh,
//     chitiet: req.body.chitiet,
//     gia: req.body.gia,
//     maloaisp: req.body.maloaisp,
//     sl: req.body.sl,
//     hsd: req.body.hsd
//   });

//   try {
//     const sa = await sp.save();
//     res.send(sa);
//   } catch (err) {
//     res.send(err);
//   }
// });
// load product route index 

const dssanpham = require('./model/saleproduct');
const dsspnoibat = require('./model/sanphamnoibat');
app.get('/', async (req, res) => {
  const data = await dssanpham.find({trangthai:"con",hieuluc:"con"});
  const data2 = await dsspnoibat.find({ trangthai: "con" });
  res.render('index', {listsp:data,listspnoibat:data2,message:""});
});
app.get('/index', async (req, res) => {
  const data = await dssanpham.find({ trangthai: 'con', hieuluc: 'con' });
  const data2 = await dsspnoibat.find({ trangthai: 'con' });
  res.render('index', { listsp: data, listspnoibat: data2,message:"" });
});

// route blog detail
app.get('/blog-details', function (req, res) {
  res.render('blog-details');
});
// route shop grid
app.get('/shop-grid', function (req, res) {
  res.render('shop-grid');
});
//route admin
app.get('/admin', function (req, res) {
  res.render('admin');
});
//route shopping cart
app.get('/shoping-cart', function (req, res) {
  res.render('shoping-cart');
});
//route shop details
app.get('/shop-details', function (req, res) {
  res.render('shop-details');
});
//route blog
app.get('/blog', function (req, res) {
  res.render('blog');
});
//route check out
app.get('/checkout', function (req, res) {
  res.render('checkout');
});
//route admin
app.get('/admin', function(req, res){
  res.render('admin');
})


app.get('/main', function (req, res) {});
app.get('/about', function (req, res) {
  res.render('about', { page: '3' });
});

// route contact
app.get('/contact', function (req, res) {
  res.render('contact');
});
const contactmessage = require('./model/contact');
app.post('/contact', async function (req, res) {
  const newcontact = new contactmessage({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });
  newcontact.save();

  const data = await dssanpham.find({ trangthai: 'con', hieuluc: 'con' });
  const data2 = await dsspnoibat.find({ trangthai: 'con' });
  res.render('index', { listsp: data, listspnoibat: data2,message:"Thanks for your contact !!!" });
});

//
