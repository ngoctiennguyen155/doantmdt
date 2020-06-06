const mongooso = require('mongoose');
const phieunhap = mongooso.Schema({
     dsnhap: [{
          id :{
               type: String, required: true,
          },
          tensp: {
               type: String, required: true,
          },
          sl: {
               type: Number, required: true,
          },
          nguoikt: {
               type: String,
          },
          trangthai: {
               type: Boolean, required: true,
          }
     }],
     status: {
          type: Number, required: true,
     },
     nguoilap: {
          type: String, required: true,
     }
});
module.exports = mongooso.model('nhaphang', phieunhap);