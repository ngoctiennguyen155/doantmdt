const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const tonkho = mongoose.Schema({
  id: {
    type: String,
    required: true,
    min: 1,
    max: 256,
    text: true,
  },
  trangthai: {
    type: Number,
    required: true,
  },
  tensp: {
    type: String,
    required: true,
  },
  sl: {
    type: String,
    required: true,
    min: 0,
  },
  hsd: {
    type: String,
    required: true,
    min: 0,
  },
  ngaynhap: {
    type: Date,
  },
  ngayhethan: {
    type: Date,
  },
});
tonkho.plugin(mongoosePaginate);
module.exports = mongoose.model('tonkho', tonkho);
// sub :         table nè : name title, json (schema);
