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
    type: Date
  },
  ngaycapnhat: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('account', acount);
// const user = new ac({
//   tennv: e,
//   email: e,
//   sdt: e,
//   gioitinh: e,
//   diachi: e,
//   chucvu: e,
//   taikhoan: e,
//   matkhau: e,
//   ngaytao: date,
//   luongcoban: 15000,
// });
// user.save();