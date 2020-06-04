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
var arr_id = [];
var router = require('express').Router();

var arr_qty =[];
var arr_sl =[];


const passport = require('passport');
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
// req.session.destroy();
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
});




app.get('/shoping-cart', function (req, res, next) {
  var cart = new Cart(req.session.cart || {});
  var coupon="";
  if(req.session.coupon)
  {
    req.session.coupon=coupon;
  }

  res.render('shoping-cart', {
    session: req.session.cart || cartnull,
    getcart: cart.genetateArr() || [],
    subtotal: cart.totalPrice || 0,
    coupon_code:coupon,
    phantram: 0,
  });
});




var giasell;

app.get('/add-to-cart', function (req, res) {
  var id = req.query.id;
  var sl = req.query.sl;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  allsp.findById(new ObjectId(id), function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    if (product.hieuluc === 'con')
      giasell = product.gia - (product.gia * product.phantram) / 100;
    else giasell = product.gia;
    cart.add(product, product._id, sl, giasell);
    req.session.cart = cart;
    res.redirect('/');
  });
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
});

//route blog
app.get('/blog', function (req, res) {
  res.render('blog');
});
//route check out
app.get('/checkout', function (req, res) {
  res.render('checkout', { session: req.session.cart || cartnull });
});


app.post('/checkout', async function (req, res, next) {
  var phantram;
  const mac = req.session.coupon;
  const newcoupon = await coupon.find({ ma: mac });
  if(!newcoupon[0]){phantram=0;}
  else{phantram=newcoupon[0].phantram} 
var cart = new Cart(req.session.cart || {});
var totalQty=0;
arr_qty=[];
// if(!req.body.y)
// {
req.body.y.forEach(e=>{ 
  arr_qty.push(e);
  totalQty++;
 });
// }
// else {
// // alert("Don't have any item on cart");
// res.redirect('/index'); ;}
 arr_id=[];
 for(var e in req.session.cart.items)
 {
   arr_id.push(e);
 }
 var arr_pro =  [];
 arr_pro = cart.genetateArr();
cart.totalPrice=0;
cart.totalQty=totalQty;
for (var i in arr_pro) {
  if(!arr_qty[i])
  {
    cart.remove(arr_id[i]);
  }
  else
  {cart.update( arr_pro[i].item,arr_id[i],arr_qty[i],giasell);}
}
req.session.cart = cart;
  res.render('checkout', {
    arr_qty: arr_qty,
    session: req.session.cart || cartnull,
    getcart: cart.genetateArr() || [],
    subtotal: cart.totalPrice || 0,
    phantram: phantram,
  });
});

const bill = require('./model/bill');
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


  


//route admin
app.get('/admin', function (req, res) {
  res.render('login');
});
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
app.get('/hoadon', function (req, res) {
  res.render('hoadon');
})
app.get('/coupon',async function (req, res) {
  const coupon = require('./model/coupon');
  const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
  res.render('coupon', { data: datacoupon });
})
app.get('/qlsanpham',async function (req, res) {
  const spl = await allsp.find({}).sort({ sl: 1 });
  res.render('qlsanpham',{data:spl});
});
//route admin
const zdadsfasdfa = [];
const ac = require('./model/accout');
app.post('/admin',async function (req, res) {
  // create user in req.body
  const e = req.body.username;
  const pw = req.body.password;
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
  const emailExistence = require('email-existence');
  emailExistence.check(email, function (error, response) {
    res.send(response);
  });
})

app.post('/continue', (req, res) => {
  res.redirect('/');
});
//
app.post('/add-coupon', async function (req, res) {
  const mac = req.body.coupon;
  req.session.coupon = mac;
  const newcoupon = await coupon.find({ ma: mac });

  var cart = new Cart(req.session.cart || {});

  res.render('shoping-cart', {
    session: req.session.cart || cartnull,
    getcart: cart.genetateArr() || [],
    subtotal: cart.totalPrice || 0,
    coupon_code:mac,
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
  res.render('mail',{mail : getmail});
});

app.get('/mailcontact', async (req, res) => {
  const mailcontactschema = require('./model/contact');
  const getmailcontact = await mailcontactschema.find({});
  res.render('mailcontact',{mailcontact : getmailcontact});
});
app.get('/magiamgia', async (req, res) => {
  const coupon = require('./model/coupon');
  const datacoupon = await coupon.find({}).sort({ trangthai: 1,phantram:1 });
  res.render('magiamgia', { data: datacoupon });
});

app.get('/nhaphang',async (req, res) => {
  let gettableproduct =await allsp.find({});
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
        }
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