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
const port = 4000;
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
const dsspnoibat = require('./model/sanpham');
const coupon = require('./model/coupon');

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
  var cart = new Cart(req.session.cart || {});
  //console.log(cart.genetateArr());
  res.render('shoping-cart', {
    session: req.session.cart || cartnull,
    getcart: cart.genetateArr() || [],
    subtotal: cart.totalPrice || 0,
    phantram: 0,
  });
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
    if (product.hieuluc === 'con')
      giasell = product.gia - (product.gia * product.phantram) / 100;
    else giasell = product.gia;
    cart.add(product, product._id, sl, giasell);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

//route shop details
var ObjectId = require('mongodb').ObjectID;
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
  res.render('checkout', { session: req.session.cart || cartnull });
});
app.post('/checkout', async function (req, res) {
  var phantram;
  const mac = req.body.coupon;
  const newcoupon = await coupon.find({ ma: mac });
  // console.log(newcoupon);
  if(!newcoupon[0]){phantram=0;}
  else{phantram=newcoupon[0].phantram} 

var cart = new Cart(req.session.cart || {});
// console.log(newcoupon[0]);
var arr_qty =[];
req.body.y.forEach(e=>{ 
  arr_qty.push(e)
 });
  res.render('checkout', {
    arr_qty: arr_qty,
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
app.get('/hoadon', function (req, res) {
  res.render('hoadon');
})
app.get('/coupon',async function (req, res) {
  const coupon = require('./model/coupon');
  const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
  console.log(datacoupon);
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
app.post('/add-coupon', async function (req, res) {
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
});

// admin route
app.get('/thongke', (req, res) => {
  res.render('thongke');
})

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