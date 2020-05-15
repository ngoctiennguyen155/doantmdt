const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const mongodb = require('mongoose');
const cors = require('cors');
require('dotenv/config');
var router = require('express').Router();

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
var path = require('path');
app.use(express.static('./public'));
//app.use(express.static(path.join(__dirname, 'public')));

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
const mongoosePaginate = require('mongoose-paginate-v2');
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
const allsp = require('./model/sanpham');
const dssanpham = require('./model/sanpham');
const dsspnoibat = require('./model/sanpham');
app.get('/', async (req, res) => {
  const data = await dssanpham.find({ trangthai: 'con', hieuluc: 'con' });
  const data2 = await dsspnoibat.find({ noibat: true });
  res.render('index', { listsp: data, listspnoibat: data2, message: '' });
});
app.get('/index', async (req, res) => {
  const data = await dssanpham.find({ trangthai: 'con', hieuluc: 'con' });
  const data2 = await dsspnoibat.find({ noibat: true });
  res.render('index', { listsp: data, listspnoibat: data2, message: '' });
});

// route blog detail
app.get('/blog-details', function (req, res) {
  res.render('blog-details');
});

// route shop grid
const options = {
  page: 1,
  limit: 12,
  collation: {
    locale: 'en',
  },
};
app.get('/shop-grid',async function (req, res, next) {
  var filter;
  var search = req.query.search || '';
  // console.log(search);
  var query = '';
  if (search == '') {
    filter = {};
    query = '';
  } else {
    filter = { maloaisp: search };
    query = search;
  }
  //console.log(filter);
  var page = req.query.page || 1;

  var aggregateQuery = allsp.aggregate();

  allsp.aggregate(filter,options, function (
    err,
    result
  ) {
    if (err) {
      console.err(err);
    } else {
      res.json(result);
    }
  });
});
//app.use(mainroutes);

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
  const data2 = await dsspnoibat.find({ noibat: true });
  res.render('index', {
    listsp: data,
    listspnoibat: data2,
    message: 'Thanks for your contact !!!',
  });
});

//
