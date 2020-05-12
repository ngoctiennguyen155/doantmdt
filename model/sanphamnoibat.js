const mongoose = require('mongoose');

const sanphamnoibat = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  tensp: {
    type: String,
    required: true,
    min: 1,
    max: 256,
  },
  fileanh: {
    type: String,
    required: true,
    min: 1,
    max: 256,
  },
  chitiet: {
    type: String,
    required: true,
    min: 1,
    max: 256,
  },
  gia: {
    type: Number,
    required: true,
    min: 1,
    max: 256,
  },
  maloaisp: {
    type: String,
    required: true,
    min: 1,
    max: 256,
  },
  sl: {
    type: String,
    required: true,
    min: 1,
  },
  hsd: {
    type: String,
    required: true,
    min: 1,
    max: 256,
  },
  phantram: {
    type: Number,
    required: true,
    min: 1,
    max: 256,
  },
  trangthai: {
    type: String,
    required: true,
    min: 1,
    max: 256,
  },
});

module.exports = mongoose.model('sanphamnoibat', sanphamnoibat);
// sub :         table nè : name title, json (schema);
