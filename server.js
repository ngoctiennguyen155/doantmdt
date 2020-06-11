const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const ejs = require('ejs');
const mongodb = require('mongoose');
const cors = require('cors');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
const csrfProctection = csrf({ cookie: true });
const multer = require('multer');
const nodemailer = require('nodemailer');
const request = require('request');
const paypal = require('paypal-rest-sdk');
require('dotenv/config');
var convertousd=0;
request('https://free.currconv.com/api/v7/convert?q=VND_USD&compact=ultra&apiKey=925acffac404d631739e',function (error, response, body) { 
  //console.log(JSON.parse(body).VND_USD * 23000);
  convertousd = JSON.parse(body).VND_USD;
  console.log(convertousd);
  }
);
var router = require('express').Router();
var arr_qty =[];
var arr_sl =[];
const passport = require('passport');
const fastcsv = require("fast-csv");
const fs = require("fs");
   
 var today = new Date();
 var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'_time_'+today.getHours()+'-'+today.getMinutes()+'-'+today.getSeconds();
 var  ws = fs.createWriteStream("checked_"+ date + ".csv");

// connect mongodb
mongodb.set('useCreateIndex', true);
mongodb.set('useFindAndModify', false);
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
app.use(express.json());
app.use(express.static('./public'));
//app.use(express.static(path.join(__dirname, 'public')));
var Cart = require('./model/cart');
const session = require('express-session');
const mongostore = require('connect-mongo')(session);

app.use(
  session({
    secret: 'mysupersecret',
    saveUninitialized: true,
    resave: true,
    // resave: true,
    store: new mongostore({ mongooseConnection: mongodb.connection }),
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 60 },
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
app.use(cookieParser());
// app.use(csrfProctection);
var urlencodedParser = bodyParser.urlencoded({ extended: false });
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
const bill = require('./model/bill');

const dsspnoibat = require('./model/sanpham');
const coupon = require('./model/coupon');
const ObjectId = require('mongodb').ObjectID;

app.get('/', async (req, res) => {
  const data = await dssanpham.find({
    trangthai: 'con',
    hieuluc: 'con',
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  const data2 = await dsspnoibat.find({
    trangthai: 'con',
    noibat: true,
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  res.render('index', {
    listsp: data,
    listspnoibat: data2,
    message: '',
    session: req.session.cart || cartnull,
  });
  //console.log(session.cart);
});

app.get('/index', async (req, res) => {
  const data = await dssanpham.find({
    trangthai: 'con',
    hieuluc: 'con',
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  const data2 = await dsspnoibat.find({
    trangthai: 'con',
    noibat: true,
    sl: { $regex: /[^0]/, $options: 'm' },
  });
  res.render('index', {
    listsp: data,
    listspnoibat: data2,
    message: '',
    session: req.session.cart || cartnull,
  });
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
app.get('/shop-grid', async function (req, res, next) {
  var filter;
  var search = req.query.search || '';
  var query = '';
  var searchbar = req.query.searchbar || '';
  if (searchbar == '') {
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
  filter.trangthai = "con";
  await allsp.paginate(filter, options, function (err, result) {
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
        session: req.session.cart || cartnull,
      });
    }
  });

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
  var cart = new Cart(req.session.cart || cartnull);

  res.render('shoping-cart', {
    session: req.session.cart || cartnull,
    getcart: cart.genetateArr() || [],
    subtotal: cart.totalPrice || 0,
    phantram: 0,
  });
});

app.get('/add-to-cart', async function (req, res) {
  var giasell;
  var id = req.query.id;
  var sl = req.query.sl;
  var cart = new Cart(req.session.cart ? req.session.cart : cartnull);
  const product = await allsp.findById({ _id: new ObjectId(id) });
    
  if (product.hieuluc == 'con')
    giasell = product.gia - (product.gia * product.phantram) / 100;
    else giasell = product.gia;
  console.log(product.hieuluc);
    cart.add(product, product._id, sl, giasell);
    req.session.cart = cart;
    res.redirect('/');
});

//route shop details

var getitem = require('./model/sanpham');
app.get('/shop-details', function (req, res) {
  var id = req.query.id;
  var o_id = new ObjectId(id);
  getitem
    .findOne({ _id: o_id })
    .then((docs) => {
      var sp = docs;
      res.render('shop-details', {
        sp: sp,
        session: req.session.cart || cartnull,
      });
    })
    .catch((err) => {
      next(err);
    });
  //console.log(item);
});

//route blog
app.get('/blog', function (req, res) {
  res.render('blog');
});
//route check out
app.get('/checkout', function (req, res) {
  
  let getct = new Cart(req.session.cart||cartnull);
  res.render('checkout', {
    coupon : req.session.coupon||0,
    session: getct,
    getcart: getct.genetateArr() || [],
  });
});
app.post('/buy', (req, res) => {

  paypal.configure({
    mode: 'sandbox', // Sandbox or live
    client_id:
      'AbRnw6VYbjNYXz0lpXGs6rLi96qBRV9cAi7tC1kGC6b7O9lqgOVPx9Vpq-Bqwi3-N8QzjRnKazrxvLIS',
    client_secret:
      'ENh8p4FKF7SK3v24Tffd9LScPj4g0Us6PoXq0qUq_7DTt2paRIX7iDHn00qIuJKPeXqU-jLsto7fBSTT',
  });
    let getct = new Cart(req.session.cart);
    let productcart = getct.genetateArr();
  const billproducts = [{
    "name": "abc",
    "sku": "1",
    "price": 10,
    "currency": "USD",
    "quality": 1
  }];
  const tt = 1023.983;
  const am = { "currency": "USD", "total": tt.toFixed(2) };
  const create_payment_json = {
    "intent": "sale",
    "payer": { payment_method: "paypal" },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": { "items": billproducts },
      "amount": am,
      "description": "sdafasdfasdfasdfa"
    }]
  };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.warn(error);
      } else {
        console.log('Create Payment Response');
        console.log(payment);
        payment.links.forEach(link => {
          if (link.rel === 'approval_url') return res.redirect(link.href);
        })
      }
    });
})
app.get('/success', (req, res) => {
  res.send({ success: 'success' });
});
app.get('/cancel', (req, res) => {
  res.send({ cancel: 'cancel' });
});
// app.post('/checkout', async function (req, res, next) {
//   var phantram;
//   const mac = req.session.coupon;
//   const newcoupon = await coupon.find({ ma: mac });
//   if(!newcoupon[0]){phantram=0;}
//   else{phantram=newcoupon[0].phantram} 
// var cart = new Cart(req.session.cart || {});
// var totalQty=0;
// arr_qty=[];
// // if(!req.body.y)
// // {
// req.body.y.forEach(e=>{ 
//   arr_qty.push(e);
//   totalQty++;
//  });

//  arr_id=[];
//  for(var e in req.session.cart.items)
//  {
//    arr_id.push(e);
//  }

// //  for(var e in arr_id)
// //  { var sl_mua=arr_qty[e];
// //   if(!check_sl(arr_id[e], sl_mua))
// //   {
    

// //     return res.redirect('shoping-cart');
// //     break;
// //   }
// // }
 
//  var arr_pro =  [];
//  arr_pro = cart.genetateArr();
// cart.totalPrice=0;
// cart.totalQty=totalQty;
// for (var i in arr_pro) {
//   if(!arr_qty[i])
//   {
//     cart.remove(arr_id[i]);
//   }
//   else
//   {cart.update(arr_id[i],arr_qty[i],giasell);}
// }
// req.session.cart = cart;
//   res.render('checkout', {
//     arr_qty: arr_qty,
//     session: req.session.cart || cartnull,
//     getcart: cart.genetateArr() || [],
//     subtotal: cart.totalPrice || 0,
//     phantram: phantram,
//   });
// });

// // function check_sl(id , sl){
// //   allsp.findById(new ObjectId(id), function (err, product) {
// //     console.log("so luong kiem tra");
// //     console.log( product.sl);
// //     console.log("so luong mua");
// //     console.log( sl);
// //     if(sl>product.sl)
// //     {
// //       console.log("vuot qua so luong kho");
// //       return false;
// //     }
// //   });
// // }



app.post('/bill', async function (req, res, next) {
var cart = new Cart(req.session.cart || {});
var sll=0;
var phantram;
  var mac ;
  mac=req.session.coupon;
  if(!mac)
  {
    mac="no";
  }
  const newcoupon = await coupon.find({ ma: mac });
  if(!newcoupon[0]){phantram=0;}
  else{phantram=newcoupon[0].phantram} 

var mang_cart =[];

var total_payment=cart.totalPrice*(100-phantram)/100;


mang_cart= cart.genetateArr();
for (var i in arr_id) {
  var id = arr_id[i];
find_id(id ,i);
}
  const bill_order = new bill({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    street_address: req.body.street_address,
    apartment_address:req.body.apartment_address,
    phone: req.body.phone,
    email: req.body.email,
    coupon: mac,
    discount_percent : phantram,
    total_order_value: cart.totalPrice,
    total_payment:  total_payment,
    bill:mang_cart,
  });
  bill_order.save();
  res.redirect('/bill');
});

function find_id(id ,i)
{
  allsp.findById(new ObjectId(id), function (err, product) {
    sll= product.sl; 
    var now  = sll- arr_qty[i];
   
    update (id , now);
  });
}

function update (id , now)
{
  allsp.updateOne({_id:new ObjectId(id)}, {$set: { sl: now }}, {upsert: true}, function(err){
  });
}


app.get('/bill', async function (req, res, next) {
  var phantram;
  const mac = req.session.coupon;
  const newcoupon = await coupon.find({ ma: mac });
  if(!newcoupon[0]){phantram=0;}
  else{phantram=newcoupon[0].phantram} 
  var cart = new Cart(req.session.cart ? req.session.cart : {});
// console.log(cart);
var mang = [];
mang = cart.genetateArr();
// console.log(mang);
  res.render('bill',{
    session: req.session.cart || cartnull,
    getcart: cart.genetateArr() || [],
    subtotal: cart.totalPrice || 0,
    phantram: phantram,
  
  });
});

//route admin
app.get('/admin', function (req, res) {
  res.render('login');
});



const billcsv = require('./model/billcsv');
var datat = [];
app.get('/hoadon', async function (req, res,next) {
  const data = await bill.find({ });
  datat=[];
  var from = "";
  var to = "";


 
  data.forEach(e=> {
    var bill_obj = new  billcsv(e);
    datat.push(bill_obj);      
        })
  res.render('hoadon',{
    listbill: data,
    day_from: from,
    day_to: to ,
  });
})

app.post('/findbyday', async function (req, res,next) {
  const data = await bill.find({ });
  datat=[];
  var data_find = [];
  var from  = req.body.from ; 
  var to =  req.body.to;


  var date_from = new Date(from);
  var date_to = new Date(to);

  
  data.forEach(bill => {
   if(  date_from.getTime()<= bill.date.getTime()  && bill.date.getTime()<= date_to.getTime()+86400000 )
   {
      data_find.push(bill);

   }
  });  
  
  data_find.forEach(e=> {
    var bill_obj = new  billcsv(e);
    datat.push(bill_obj);      
        })

   res.render('hoadon',{
    listbill: data_find,
    day_from: from,
    day_to: to ,
  });

});


app.post('/export_csv', async function (req, res,next) {



  fastcsv
    .write(datat, { headers: true })
    .on("finish", function() {                                                                  
      console.log("Write to bezkoder_mongodb_fastcsv.csv successfully!");
    })
    .pipe(ws);
  
 


res.redirect("/hoadon");
})


app.get('/coupon',async function (req, res) {
  const coupon = require('./model/coupon');
  const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
  res.render('coupon', { data: datacoupon });
})

app.get('/qlsanpham',async function (req, res) {
  const spl = await allsp.find({}).sort({ sl: 1 });
  //console.log(spl);
  res.render('qlsanpham',{data:spl});
});
//route admin
const zdadsfasdfa = [];
const ac = require('./model/accout');
app.post('/admin',async function (req, res) {
  // create user in req.body
  const e = req.body.username;
  const pw = req.body.password;
  console.log(e);
  console.log(pw);
  let dataacc = await ac.find({});
  let dataac = [];
  dataac[0] = dataacc;
  let user = await ac.find({ email: e });
  if (user.length != 0) {
   var validatehashpw = await bcrypt.compare(pw, user[0].matkhau); 
  }
  if (validatehashpw) {
    if (user[0].chucvu == "admin") {
      zdadsfasdfa[1] = user[0].email;
      res.render('taikhoan', { dataac: dataac,user:user[0].email });
    } else if (user[0].chucvu == "nhanvien") {
      res.render('thongke');
    } else {
      res.redirect('/admin');
    }
  } else {
    res.redirect('/admin');
  }
  
});
////

app.get('/taikhoan', async (req, res) => {
  const dataac = await ac.find({});
  //console.log(dataac);
  zdadsfasdfa[0] = dataac;
  res.render('taikhoan', { dataac: zdadsfasdfa,user:zdadsfasdfa[1]});
});
//
app.get('/main', function (req, res) {});
app.get('/about', function (req, res) {
  res.render('about', { page: '3', session: req.session.cart || cartnull });
});

// route contact
app.get('/contact', function (req, res) {
  res.render('contact', { session: req.session.cart || cartnull });
});

app.get('/profile', function (req, res) {
  res.render('profile');
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
app.post('/mailsub',async (req, res) => {
  var email = req.body.email;
  const e = require('./model/mail');
  const gete = await e.find({ email: email });
  console.log(gete);
  if (gete.length == 0) {
    const newe = new e({
      email: email,
    });
    newe.save();
  }
  res.send('successsub');
})
app.post('/validateemail', (req, res) => {
  var email = req.body.email;
  console.log(email);
  const emailExistence = require('email-existence');
  emailExistence.check(email, function (error, response) {
    res.send(response);
  });
})
//
app.post('/checkcoupon', async function (req, res) {
  let getcoupon = await coupon.find({ ma: req.body.id ,trangthai:1});
  let phantramcoupon = 0;
  if (getcoupon.length == 1) {
    phantramcoupon = getcoupon[0].phantram;
    req.session.coupon = phantramcoupon;
  }
  res.send({ phantram: phantramcoupon });
});
app.post('/updatesoluong', async (req, res) => {
  if (typeof req.body.sl === 'number') {
    //console.log(req.body.sl);
    let getallsl = await allsp.findById({ _id: new ObjectId(req.body.id[1]) });
    if (Number(req.body.sl) >= 0 && Number(req.body.sl) <= Number(getallsl.sl)) {
      //console.log(req.body.sl, getallsl.sl);
      let nc = new Cart(req.session.cart);
      let id_ = req.body.id[1];
      nc.update(id_, req.body.sl);
      req.session.cart = nc;
      res.send({ sl: 0,sessioncart : req.session.cart});
    } else if (Number(req.body.sl) > Number(getallsl.sl)) {
      let nc = new Cart(req.session.cart);
      let id_ = req.body.id[1];
      nc.update(id_, getallsl.sl);
      req.session.cart = nc;
      res.send({ sl: Number(getallsl.sl), sessioncart: req.session.cart });
    } else res.send({ sl: 0,sessioncart : req.session.cart });
  }else res.send({ sl: 0, sessioncart: req.session.cart });
})
// admin route
var product = [];
var bill_count = [];
var mail_count = [];
var year_now = new Date();

app.get('/thongke', (req, res) => {

var namhientai = year_now.getFullYear();
var namtruoc  = namhientai-1;
  for(var i=0 ; i<=12;i++)
  {
    product[i]=0;
  }
  
   for(var i = 0 ; i <=12 ; i++ )
   {
     bill_count[i]=0;
   }
  
   for(var i = 0 ; i <=12 ; i++ )
   {
     mail_count[i]=0;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
   }
  res.render('thongke',
 {
  bill:bill_count,
  product:product,
  mail:mail_count,
  namhientai:namhientai,
  namtruoc:namtruoc,
 });
})

// app.post('/pie',async (req, res,next) => {
//   var year = req.body.Courses;
// var start = new Date(Number(year), 1, 1);
// var end = new Date(Number(year), 12, 31);
// if(namhientai==year_now.getFullYear())
// {
//   namtruoc= namhientai-1;
// }  
// else 
// {
//   namtruoc = year_now.getFullYear();
// }
// const data = await bill.find({date: {$gte: start, $lt: end}});

// data.forEach(e => {
//   var qty_bill=0;

// e.

 
//   res.render('Pie_Chart');
// });
// })


app.post('/thongke', async function (req, res,next) {
  var year1 = req.body.Courses;
  var start = new Date(Number(year1), 1, 1);
  var end = new Date(Number(year1), 12, 31);
  if(year1==year_now.getFullYear())
  {
    var year2= Number(year1) -1;
  }  
  else 
  {
    var year2 = Number(year1) + 1;
  }
  
  for(var i=0 ; i<=12;i++)
  {
    product[i]=0;
  }
  
   for(var i = 0 ; i <=12 ; i++ )
   {
     bill_count[i]=0;
   }
  
   for(var i = 0 ; i <=12 ; i++ )
   {
     mail_count[i]=0;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
   }
  
  const data = await bill.find({date: {$gte: start, $lt: end}});
  const data2 = await contactmessage.find({date: {$gte: start, $lt: end}});
   
    data.forEach(e => {
      var qty_bill=0;
  
    switch(e.date.getMonth()+1) {
      case 1:
        e.bill.forEach(obj=>{
          qty_bill+=Number(obj.qty);   
          })
          product[1]+=qty_bill ;
        break;
      case 2:
        e.bill.forEach(obj=>{
          qty_bill+=Number(obj.qty);
          console.log(obj.qty);
      
          })
          product[2]+=qty_bill ;
        break;
        case 3:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
            console.log(obj.qty);
        
            })
          product[3]+=qty_bill ;
        
        break;
        case 4:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
            console.log(obj.qty);
        
            })
          product[4]+=qty_bill ;
        
        break;
        case 5:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[5]+=qty_bill ;
        
        break;
        case 6:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[6]+=qty_bill ;
        
        break;
        case 7:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[7]+=qty_bill ;
        
        break;
        case 8:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[8]+=qty_bill ;
        
        break;
        case 9:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[9]+=qty_bill ;
        
        break;
        case 10:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[10]+=qty_bill ;
        
        break;
        case 11:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[11]+=qty_bill ;
        
        break;
        case 12:
          e.bill.forEach(obj=>{
            qty_bill+=Number(obj.qty);
          
            })
          product[12]+=qty_bill ;
        
        break;
     
    }
  })
  
   load_data(data,bill_count);
   load_data(data2,mail_count);
  
   res.render('thongke',
 {
  bill:bill_count,
  product:product,
  mail:mail_count,
  namtruoc:year1,
  namhientai:year2,
 });
    
    
  })
  
  
  
  function load_data(data,array)
  {
    data.forEach(e=>{
     
  
      switch(e.date.getMonth()+1) {
       case 1:
         array[1]++;
         break;
       case 2:
         array[2]++;     
         break;
         case 3:
           array[3]++;      
         break;
         case 4:
           array[4]++;      
         break;
         case 5:
           array[5]++;     
         break;
         case 6:
           array[6]++;
         
         break;
         case 7:
           array[7]++;
         
         break;
         case 8:
           array[8]++;
         
         break;
         case 9:
           array[9]++;
         
         break;
         case 10:
           array[10]++;
         
         break;
         case 11:
           array[11]++;
         
         break;
         case 12:
           array[12]++;
         
         break;
      
     }
    })
  }


app.get('/mail',async (req, res) => {
  const mailschema = require('./model/mail');
  const getmail =await mailschema.find({});
  console.log(getmail);
  res.render('mail',{mail : getmail});
});

app.get('/mailcontact', async (req, res) => {
  const mailcontactschema = require('./model/contact');
  const getmailcontact = await mailcontactschema.find({});
  console.log(getmailcontact);
  res.render('mailcontact',{mailcontact : getmailcontact});
});
app.get('/magiamgia', async (req, res) => {
  const coupon = require('./model/coupon');
  const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
  console.log(datacoupon);
  res.render('magiamgia', { data: datacoupon });
});

app.get('/nhaphang',async (req, res) => {
  let gettableproduct =await allsp.find({});
  //console.log(gettableproduct);
  res.render('nhaphang',{data:gettableproduct});
})
app.get('/xacnhannhaphang',(req, res) => {
  res.render('xacnhannhaphang');
})


// ajax route 
app.put('/updatephantram',async (req, res) => {
  var id = req.body.id;
  var phantram = req.body.phantram;
  var old;  
  var phantramold =await allsp.findById({ _id: new ObjectId(id) }, (err, result) => {
    old = result.phantram;
  });

  if (phantram >= 0 && phantram <= 100) {
    allsp.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { phantram: phantram } },
      { new: true },
      (err, doc) => {
        if (err) {
          console.log('update false');
        }
        console.log(old);
      }
    );
    res.send({ message: 'Update success !!!',status:1});
  } else {
    res.send({ message: 'Somethong wrong !!!', status: 0, old:old });
  }
})

app.put('/updatenoibat',async (req, res) => {
  var id = req.body.id;
  var noibat = req.body.noibat;
  console.log(id, noibat);
  allsp.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { noibat: !noibat } },
    { new: true },
    (err, doc) => {
      if (err) {
        res.send({ message: 'Update success !!!' });
      }
      res.send({ message: 'Update success !!!' });
    }
  );
})


app.put('/updatetrangthai', async (req, res) => {
  var id = req.body.id;
  var status = req.body.status;
  if (status == "Hết") {
    status = "con";
  } else status = "het";
  console.log(id, status);
  allsp.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { trangthai: status } },
    { new: true },
    (err, doc) => {
      if (err) {
        res.send({ message: 'Update success !!!' });
      }
      res.send({ message: 'Update success !!!' });
    }
  );
});

app.put('/updatehieuluc', async (req, res) => {
  var id = req.body.id;
  var status = req.body.hieuluc;

  console.log(id, status);
  allsp.findByIdAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { hieuluc: status } },
    { new: true },
    (err, doc) => {
      if (err) {
        res.send({ message: 'Update success !!!' });
      }
      res.send({ message: 'Update success !!!' });
    }
  );
});


app.post('/creatcoupon', (req, res) => {
  var sl = req.body.sl;
  var phantram = req.body.phantram;
  //console.log(sl);
  const randomString = require('randomstring');
  const newcoupon = require('./model/coupon');
  for (var i = 1; i <= sl; i++){
    var z = new newcoupon({
      ma: randomString.generate({
        length: 7,
        charset: 'alphanumeric',
      }),
      phantram: phantram,
      trangthai:0
    });
    z.save();
  }
  res.send('Create Success !!!');
})

app.put('/updateblockaccout', async (req, res) => {
  let id = req.body.id;
  let block = req.body.status;

  ac.findByIdAndUpdate({ _id: new ObjectId(id) },
    { $set: { block: block } },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log(err);
      }
      if(block)
        res.send({ message: 'Blocked !!!' });
      else res.send({ message: 'UnBlocked !!!' });
    });
});

app.put('/createaccout', async (req, res) => {
  let loai = req.body.loai;
  let tennv = req.body.tennv;
  let email = req.body.email;
  let sdt = req.body.sdt;
  let chucvu = req.body.chucvu;
  let pw = req.body.password;
 
  const salt =await bcrypt.genSalt(10);
  const pwhash = await await bcrypt.hash(req.body.password, salt);
  console.log(salt);
  console.log(pwhash);
  let checkmail = await ac.find({ email: email });
  let cout = checkmail.length;
  if (loai == "tao") {
    let nac =await new ac({
      tennv: tennv,
      email: email,
      sdt: sdt,
      gioitinh: "nam",
      diachi: "273 an duong vuong",
      chucvu: chucvu,
      taikhoan: email,
      matkhau: await bcrypt.hash(req.body.password, salt),
      luongcoban: "15000",
      block: false,
      ngaytao: Date.now(),
      ngaycapnhat: Date.now()
    });
    if (cout == 0) {
      nac.save();
      res.send('Create account success !!!');
    } else res.send('Email exist !!!');
  } else {
    let id = req.body.id;
    let objac = {
      tennv: tennv,
      email: email,
      sdt: sdt,
      gioitinh: '',
      diachi: '',
      chucvu: chucvu,
      taikhoan: email,
      ngaycapnhat: Date.now(),
    };
    if (pw) {
      objac.matkhau = await bcrypt.hash(req.body.password, salt);
    }
    if (pw.length == 0) {
      console.log('adf');
    }
    await ac.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: objac,
      }, { new: true }, (err, doc) => {
        if (err) console.log(err);
         res.send('Update accout success !!!');
      }
    );
  }
});


app.post('/addproduct',async (req, res) => {
  let getnamepicture = req.body.anh;
  console.log(getnamepicture);
  
   const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       if (
         file.mimetype !== 'image/png' &&
         file.mimetype !== 'image/jpg' &&
         file.mimetype !== 'image/jpeg'
       ) {
         res.send('Error : Chỉ được upload file png,jpg,jpeg');
         return false;
       }
      cb(null, './public/images/'+req.body.maloaisp);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  var upload = multer({ storage: storage }).single('anh');
    upload(req, res,async function (err) {
    if (err) {
      console.log('Error : Somgthing went wrong !!!');
    }
    let objproduct = {
      tensp: req.body.tensp,
      fileanh: req.body.anh,
      chitiet: "abc",
      gia: req.body.gia,
      maloaisp: req.body.maloaisp,
      sl: "0",
      hsd: "1 tháng",
      phantram: 0,
      trangthai: 'het',
      hieuluc: 'het',
      noibat: false,
      ncc :{tenncc :"",gia:0,sdt:"",email:""},
    };
    if (req.body._type == 'tao') {
      let newproduct = new allsp(objproduct);
      newproduct.save(); 
    
    } else {
      var objfixproduct = { tensp: req.body.tensp, gia: req.body.gia, maloaisp: req.body.maloaisp };
      if (req.body.anh) {
        objfixproduct.fileanh = req.body.anh;
      }
      await allsp.findByIdAndUpdate({ _id: new ObjectId(req.body.id) }, { $set: objfixproduct }, { new: true });

    }
    console.log(objfixproduct);
  });
  
  res.redirect('/qlsanpham');
})

app.post('/sendemailtouser', async (req, res) => {
  let htmlt =
    '<p>Nội dung: ' + req.body.noidung + '</p>';
  if (req.body.coupon) {
    //console.log(req.body);
    let newcoupon =await coupon.find({ ma: req.body.coupon,trangthai: 0 });
    if (newcoupon.length == 0) {
      res.send('Mã giảm giá không tồn tại hoặc đã được sử dụng !!!!'); return;
    } else {
      htmlt +=
        '<p>Tặng mã giảm giá: ' +
        req.body.coupon +
        '</p>';
      await coupon.findOneAndUpdate({ ma: req.body.coupon, trangthai: 0 },{trangthai : 1}, { new : true });
    }
  }
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env._EMAIL,
      pass: process.env._PASSWORD,
    },
  });
  var mailOptions = {
    from: 'OGANI <' + process.env._EMAIL + '>',
    to: req.body.email,
    subject: req.body.tieude,
    html: htmlt,
  };
  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
  });
  res.send('Email đã gửi !!!');
})
app.get('/nhacungcap',async (req, res) => {
  const spl = await allsp
    .find({})
    .sort({ sl: 1 });
  //console.log(spl);
  res.render('nhacungcap',{data:spl});
})
app.put('/updatencc', async (req, res) => {
  console.log(req.body);
  await allsp.findByIdAndUpdate({ _id: new ObjectId(req.body.id) },
    { $set: { ncc: { tenncc: req.body.tenncc, gia: req.body.gia, sdt: req.body.sdt, email: req.body.email } } },
    { new: true });
  res.send('Update success ...');
})

app.post('/apisession', (req, res) => {
  let id = req.body.id;
  //console.log(id);
  var crt = new Cart(req.session.cart);
  crt.remove(id);
  crt.totalQty--;
  req.session.cart = crt;
  res.send(req.session.cart);
})

app.put('/regetcoupon',(req, res)=> {
  if (Number(req.body.phantram) != req.session.coupon) {
    req.session.coupon = 0;
  }
})

