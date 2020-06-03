module.exports = function Cart(oldCart) {
     this.items = oldCart.items || {};
     this.totalQty = oldCart.totalQty || 0 ;
     this.totalPrice = oldCart.totalPrice || 0 ;

     this.add = function (item, id,sl,giasell) {
          var storeItem = this.items[id];
          if (!storeItem) {
               storeItem = this.items[id] = { item: item, qty: sl, price: giasell, totalprice: sl * giasell };
               this.totalQty++;
          }else{
               storeItem.qty = sl;
               storeItem.totalprice = storeItem.qty * storeItem.price;
          }
          this.totalPrice += storeItem.totalprice;
     };
     
     this.update = function (item, id,sl,giasell) {
          var storeItem = this.items[id];
               storeItem.qty = sl;
               storeItem.totalprice = storeItem.qty * storeItem.price;
          this.totalPrice += storeItem.totalprice;
     };

     this.remove = function (id) {
           delete this.items[id];
              
     };

     this.genetateArr = function () {
          var arr = [];
          for (var id in this.items) {
               arr.push(this.items[id]);
          }
          return arr;
     }
}