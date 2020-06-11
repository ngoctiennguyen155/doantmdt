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
               storeItem.qty =Number(storeItem.qty)+ Number(sl);
               storeItem.totalprice = storeItem.qty * storeItem.price;
          }
          this.totalPrice += giasell*sl;
     };
     
     this.update = function (id,sl) {
          var storeItem = this.items[id];
          if (Number(storeItem.qty) < Number(sl)) {
               let congthem = Number(sl) - Number(storeItem.qty);
               storeItem.qty = sl;
               storeItem.totalprice = storeItem.qty * storeItem.price;
               this.totalPrice += (congthem*storeItem.price);
          } else if (Number(storeItem.qty) > Number(sl)) {
               let trudi = Number(storeItem.qty) - Number(sl);
               storeItem.qty = sl;
               storeItem.totalprice = storeItem.qty * storeItem.price;
               this.totalPrice -= trudi * storeItem.price;
          }
     };

     this.remove = function (id) {
          var storeItem = this.items[id];
          this.totalPrice -= storeItem.totalprice;
           delete this.items[id];
              
     };
     this.deleteall = function () {
       this.items ={};
       this.totalQty = 0;
       this.totalPrice =0;
     };

     this.genetateArr = function () {
          var arr = [];
          for (var id in this.items) {
               arr.push(this.items[id]);
          }
          return arr;
     }
}