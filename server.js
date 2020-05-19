const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const mongodb = require('mongoose');
const cors = require('cors');
require('dotenv/config');

var router = require('express').Router();

const passport = require('passport');
// connect mongodb
mongodb.set('useCreateIndex', true);
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


/// middleware
app.use(express.static('./public'));
//app.use(express.static(path.join(__dirname, 'public')));
var Cart = require('./model/cart');
const session = require('express-session');
const mongostore = require('connect-mongo')(session);

app.use(
  session({
    secret: 'nguyenngoctien',
    saveUninitialized: true,
    resave: true,
    // resave: true,
    store: new mongostore({ mongooseConnection: mongodb.connection })
    // ,
    // cookie: { maxAge: 1000 * 60 * 60 },
  })
);

//
app.set('views', './views');
app.set('view engine', 'ejs');
const port = 3000;
app.listen(port, console.log(`Listening on port ${port}...`));

const schema = require('./model/schema');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: true });
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
const cartnull = { item: {}, totalQty: 0, totalPrice: Number(0) };
const allsp = require('./model/sanpham');
const dssanpham = require('./model/sanpham');
const dsspnoibat = require('./model/sanpham');
app.get('/', async (req, res) => {
  const data = await dssanpham.find({
    trangthai: 'con',
    hieuluc: 'con',
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  const data2 = await dsspnoibat.find({
    noibat: true,
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  res.render('index', { listsp: data, listspnoibat: data2, message: '',session:req.session.cart || cartnull});
  //console.log(session.cart);
});
app.get('/index', async (req, res) => {
  const data = await dssanpham.find({
    trangthai: 'con',
    hieuluc: 'con',
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  const data2 = await dsspnoibat.find({
    noibat: true,
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  res.render('index', { listsp: data, listspnoibat: data2, message: '',session:req.session.cart || cartnull });
});

// route blog detail
app.get('/blog-details', function (req, res) {
  res.render('blog-details');
});

// route shop grid
// mongoosePaginate.paginate.options = {
//   lean: true,
//   limit: 20,
// };
app.get('/shop-grid',async function (req, res, next) {
  var filter;
  var search = req.query.search || '';
  var query = '';
  var searchbar = req.query.searchbar || "";
  if (searchbar == "") {
    if (search == '') {
      filter = { sl: { $regex: /[^0]/, $options: 'm' } };
      query = '';
    } else {
      filter = { maloaisp: search, sl: { $regex: /[^0]/, $options: 'm' } };
      query = search;
    }
  } else {
    var querysearchbar = `"\" + ${searchbar} + \""`;
    filter = {
      $text: { $search: querysearchbar, $caseSensitive: false },
      sl: { $regex: /[^0]/, $options: 'm' },
    };
    query = searchbar;
  }

  var page = req.query.page || 1;
  var perPage = 12;
  const options = {
    page: page,
    limit: 12,
    collation: {
      locale: 'en',
    },
  };
  //console.log(filter);
  await allsp.paginate(filter,options, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.render('shop-grid', {
        dssp: result.docs,
        page: result.page,
        pages: result.totalPages,
        query: query,
        total: result.totalDocs,
        nextPage: result.hasNextPage,
        perPage: result.hasPrevPage,
        session:req.session.cart || cartnull
      });
    }
  })


  // await allsp
  //       .find(filter)
  //       .skip((perPage * page) - perPage)
  //       .limit(perPage)
  //       .exec(function(err, sanphamm) {
  //           allsp.countDocuments().exec(function(err, count) {
  //               if (err) return next(err)
  //               res.render('shop-grid', {
  //                 dssp: sanphamm,
  //                 current: page,
  //                 pages: Math.ceil(count / perPage),
  //                 query: query,
  //                 total: count
  //               })
  //           })
  //       })
});
//app.use(mainroutes);


//route shopping cart

// app.use(passport.session());
// app.use(function (req, res, next) {
//   const session = req.session;
//   next();
// });

app.get('/shoping-cart', function (req, res, next) {
  var cart = new Cart(req.session.cart ||{});
  console.log(cart.genetateArr());
  res.render('shoping-cart', { session: req.session.cart || cartnull ,getcart: cart.genetateArr()||[],subtotal:cart.totalPrice || 0,phantram : 0});
});

app.get('/add-to-cart', function (req, res) {
  var id = req.query.id;
  var sl = req.query.sl;
  // console.log(id);
  // console.log(sl);
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  allsp.findById(new ObjectId(id), function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    var giasell;
    if(product.hieuluc==="con")
      giasell = product.gia - (product.gia * product.phantram / 100);
    else giasell = product.gia;
    cart.add(product, product._id,sl,giasell);
    req.session.cart = cart;
    console.log(req.session.cart);   
    res.redirect('/');
  })

})


//route shop details
var ObjectId = require('mongodb').ObjectID;
var getitem = require('./model/sanpham');
app.get('/shop-details', function (req, res) {
  var id = req.query.id;
  var o_id = new ObjectId(id);
  getitem.findOne({ _id: o_id }).then(docs => {
    var sp = docs;
    res.render('shop-details', {
      sp: sp,
      session: req.session.cart || cartnull,
    });
  }).catch(err => {
    next(err);
  });;
  //console.log(item); 
});


//route blog
app.get('/blog', function (req, res) {
  res.render('blog');
});
//route check out
app.get('/checkout', function (req, res) {
  res.render('checkout', { session: req.session.cart || cartnull });
});
//route admin
app.get('/admin', function(req, res){
  res.render('login');
})
//route admin
const ac = require('./model/accout');
app.post('/admin',function (req, res) {
  // create user in req.body
  const e = req.body.username;
  const pw = req.body.password;
  console.log(e);
  console.log(pw);
  const user = ac.findOne({ email: e,matkhau:pw }, (err, result) => {
    if (err) {
      throw err;
    };
    if (result) {
      res.render('admin');
    } else {
      res.redirect('/admin');
    }
  });
});
////

app.get('/main', function (req, res) {});
app.get('/about', function (req, res) {
  res.render('about', { page: '3', session: req.session.cart || cartnull });
});

// route contact
app.get('/contact', function (req, res) {
  res.render('contact', { session: req.session.cart || cartnull });
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
    session: req.session.cart || cartnull,
  });
});

//
const coupon = require('./model/coupon');
app.post('/add-coupon',async function (req, res) {
  const mac = req.body.coupon;
  const newcoupon = await coupon.find({ ma: mac });
  console.log(newcoupon[0].phantram);
  var cart = new Cart(req.session.cart || {});
   res.render('shoping-cart', {
     session: req.session.cart || cartnull,
     getcart: cart.genetateArr() || [],
     subtotal: cart.totalPrice || 0,
     phantram: newcoupon[0].phantram,
   });
})
