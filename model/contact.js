const mongoose = require('mongoose');

const contactmessage = mongoose.Schema({
     name: {
          type: String,
          required: true,
          min: 1,
          max:256
     },
     email: {
          type: String,
          required: true,
          min: 11,
          max:256
     },
     message: {
          type: String,
          required: true,
          min: 1,
          max:10000
     },
     date: {
          type: Date,
          default : Date.now
     }
});

module.exports = mongoose.model('contact_message', contactmessage);
// sub :         table nè : name title, json (schema);