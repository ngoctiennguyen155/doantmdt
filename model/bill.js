const mongoose = require('mongoose');

const bill = mongoose.Schema({
    first_name: {
          type: String,
          required: true,
          min: 1,
          max:256
     },
     last_name: {
          type: String,
          required: true,
          min: 1,
          max:256
     },
     street_address: {
          type: String,
          required: true,
          min: 1,
          max:1000
     },
     apartment_address: {
        type: String,
        required: true,
        min: 1,
        max:1000
   },
     phone: {
        type: String,
        required: true,
        min: 1,
        max:1000
   },
   email: {
    type: String,
    required: true,
    min: 1,
    max:1000
},
coupon: {
     type: String,
     required: true,
     min: 1,
     max:1000
 },
discount_percent: {
     type: String,
     required: true,
     min: 1,
     max:1000
 },
 total_order_value: {
     type: String,
     required: true,
     min: 1,
     max:1000
 },
 total_payment: {
     type: String,
     required: true,
     min: 1,
     max:1000
 },

bill: {
     type: Array,
     required: true,
     min: 1,
     max:10000
 },

// items: { item: item, qty: sl, price: giasell, totalprice: sl * giasell }
// ,

});

module.exports = mongoose.model('bill', bill);
// sub :         table nè : name title, json (schema);