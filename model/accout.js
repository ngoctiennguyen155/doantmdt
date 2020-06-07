const mongoose = require('mongoose');

const acount = mongoose.Schema({
  tennv: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  sdt: {
    type: String,
    required: true,
  },
  gioitinh: {
    type: String,
    required: true,
  },
  diachi: {
    type: String,
    required: true,
  },
  chucvu: {
    type: String,
    required: true,
  },
  taikhoan: {
    type: String,
    required: true,
  },
  matkhau: {
    type: String,
    required: true,
  },
  luongcoban: {
    type: String,
    required: true,
  },
  ngaytao: {
    type: Date,
  },
  ngaycapnhat: {
    type: Date,
  },
  thongtinkhac: {
    type: String,
  },
  block: {
    type: Boolean,
    require:true
  },
});

module.exports = mongoose.model('account', acount);
// const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
// const user = new acount({
//   tennv: "pham nguyen tiep",
//   email: "tiep@gmail.com",
//   sdt: "0123456789",
//   gioitinh: "nam",
//   diachi: "11 22 3 3",
//   chucvu: "admin",
//   taikhoan: "tiep@gmail.com",
//   matkhau: "1",
//   ngaytao: date,
//   ngaycapnhat:date,
//   luongcoban: 15000,
//   block :true
// });
// user.save();