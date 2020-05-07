const mongoose = require('mongoose');

const schema = mongoose.Schema({
     title: {
          type: String,
          required: true
     }
});

module.exports = mongoose.model('title', schema);
// sub :         table nè : name title, json (schema);    