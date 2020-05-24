const mongoose = require('mongoose');

const mail = mongoose.Schema({
     email: {
          type: String,
          required: true,
          min: 11,
          max: 256,
     },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('mail',mail);
// sub :         table nè : name title, json (schema);
