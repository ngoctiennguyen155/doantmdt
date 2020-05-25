const mongoose = require('mongoose');

const coupon = mongoose.Schema({
  ma: {
    type: String,
    required: true,
  },
  phantram: {
    type: Number,
    required: true
  },
  trangthai: {
    type: Number,
    required: true,
}
});

module.exports = mongoose.model('coupon', coupon);
