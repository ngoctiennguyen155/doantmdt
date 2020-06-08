module.exports = function billcsv(bill) {
    this.name = bill.first_name;
    this.address = bill.street_address;
    this.phone = bill.phone;
    this.email= bill.email;
    this.coupon = bill.coupon;
    this.discount_percent = bill.discount_percent  ; 
    this.total_order_value = bill.total_order_value;
    this.total_payment  = bill.total_payment;
    

    
    
}