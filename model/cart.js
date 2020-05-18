module.exports = function Cart(oldCart) {
     this.items = oldCart.items || {};
     this.totalQty = oldCart.totalQty || 0 ;
     this.totalPrice = oldCart.totalPrice || 0 ;

     this.add = function (item, id,sl,giasell) {
          var storeItem = this.items[id];
          if (!storeItem) {
               storeItem = this.items[id] = { item: item, qty: Number(sl), price: giasell, totalprice: Number(sl) * giasell };
               this.totalQty++;
          }else{
               storeItem.qty += Number(sl);
               storeItem.totalprice = storeItem.qty * giasell;
          }
          this.totalPrice += Number(sl) * giasell;
     };
     this.genetateArr = function () {
          var arr = [];
          for (var id in this.items) {
               arr.push(this.items[id]);
          }
          return arr;
     }
}