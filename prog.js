const availableCoupons = [];

const COUPON_CODE_INVALID = "Invalid coupon code";
const COUPON_CODE_NOT_VALID_ON_OUTLET = "Coupon code is not valid on this current outlet";
const COUPON_CODE_EXPIRED = "Coupon code expired";
const COUPON_CODE_MINIMUM_CART_VALUE_UNSATISFIED = "Cart value after discount is less than ";
const COUPON_CODE_NOT_ACTIVE = "Coupon code is not active";
const COUPON_APPLIED = "Coupon applied";
const COUPON_CODE_MINIMUM_QUANTITY_NOT_SATISFIED = "Buy 1 Get 1 requires at least 2 items in cart";

const COUPON_TYPE_PERCENTAGE = "Percentage";
const COUPON_TYPE_DISCOUNT = "Discount";
const COUPON_TYPE_DISCOUNT_AND_CASHBACK = "Discount&Cashback";
const COUPON_TYPE_PERCENTAGE_AND_CASHBACK = "Percentage&Cashback";
const COUPON_TYPE_BOGO = "Bogo";


const checkValidCoupon = (coupon, outletId) => {
    let today = new Date().getTime();
    let result = {
        "status": false,
        "message": COUPON_CODE_INVALID
    };

    if (Object.keys(coupon).length === 0) return result;

    if (coupon.is_active === false) {
        result.message = COUPON_CODE_NOT_ACTIVE;
        return result;
    }

    if (Date(coupon.start_date).getTime() > today) {
        return result;
    }
    
    if (Date(coupon.end_date).getTime() < today) {
        result.message = COUPON_CODE_EXPIRED;
        return result;
    }

    if (coupon.applicable_outlet_ids.length > 1){
        if(!outletId in coupon.applicable_outlet_ids){
            result.message = COUPON_CODE_NOT_VALID_ON_OUTLET;
            return result;
        }
    }

    result.status = True;
    result.message = "";
    return result;
}

const getTotalAmount = (cart) => {
    return cart.reduce((total, item) => total + item.quantity * item.unit_cost, 0.0);
}

const getTotalItemCount = (cart) => {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

const handlePercentage = (cart, coupon, response) => {
    const totalAmount = getTotalAmount(cart);
    const discount = (totalAmount*coupon.value)/100;
    if (discount > coupon.maximum_discount) discount = coupon.maximum_discount;

    if ((totalAmount - discount) < coupon.minimum_delivery_amount_after_discount) {
        response.message = COUPON_CODE_MINIMUM_CART_VALUE_UNSATISFIED + coupon.minimum_delivery_amount_after_discount;
        return response;
    }

    response.status = true;
    response.message = COUPON_APPLIED;
    response.discount = discount;
    response.cashback = 0.0;
    return response;
}

const handleDiscount = (cart, coupon, response) => {
    const totalAmount = getTotalAmount(cart);
    const discount = coupon.maximum_discount;

    if ((totalAmount - discount) < coupon.minimum_delivery_amount_after_discount) {
        response.message = COUPON_CODE_MINIMUM_CART_VALUE_UNSATISFIED + coupon.minimum_delivery_amount_after_discount;
        return response;
    }

    response.status = true;
    response.message = COUPON_APPLIED;
    response.discount = discount;
    response.cashback = 0.0;
    return response;
}

const handlePercentAndCashback = (cart, coupon, response) => {
    const totalAmount = getTotalAmount(cart);
    const discount = (totalAmount*coupon.value)/100;    
    if (discount > coupon.maximum_discount) discount = coupon.maximum_discount;

    if ((totalAmount - discount) < coupon.minimum_delivery_amount_after_discount) {
        response.message = COUPON_CODE_MINIMUM_CART_VALUE_UNSATISFIED + coupon.minimum_delivery_amount_after_discount;
        return response;
    }

    response.status = true;
    response.message = COUPON_APPLIED;
    response.discount = discount;
    response.cashback = coupon.cashback_value;
    return response;
}


const handleDiscountAndCashback = (cart, coupon, response) => {
    const totalAmount = getTotalAmount(cart);
    const discount = coupon.maximum_discount;

    if ((totalAmount - discount) < coupon.minimum_delivery_amount_after_discount) {
        response.message = COUPON_CODE_MINIMUM_CART_VALUE_UNSATISFIED + coupon.minimum_delivery_amount_after_discount;
        return response;
    }

    response.status = true;
    response.message = COUPON_APPLIED;
    response.discount = discount;
    response.cashback = coupon.cashback_value;
    return response;
}


const handleBOGO = (cart, coupon, response) => {
    const totalAmount = getTotalAmount(cart);
    let discount = 0;
    let itemCount = getTotalItemCount(cart);
    if (itemCount < 2) {
        response.message = COUPON_CODE_MINIMUM_QUANTITY_NOT_SATISFIED;
        return response;
    }

    itemCount = itemCount/2;

    cart.sort((a, b) => {
        return a.value > b.value;
    });

    let i = 0;
    while (itemCount > 0 ) {
        if(itemCount - cart[i].quantity >= 0) {
            discount += cart[i].quantity * cart[i].unit_cost;
            itemCount -= cart[i].quantity;
        } else {
            discount += itemCount*cart[i].unit_cost;
            itemCount = 0;
        }
        i += 1;
    }
    if (discount > coupon.maximum_discount) discount = coupon.maximum_discount;
    
    if (totalAmount - discount < coupon.minimum_delivery_amount_after_discount) {
        response.message = COUPON_CODE_MINIMUM_CART_VALUE_UNSATISFIED + coupon.minimum_delivery_amount_after_discount;
        return response;
    }

    response.status = true;
    response.message = COUPON_APPLIED;
    response.discount = discount;
    response.cashback = coupon.cashback_value;
    return response;
}


const applyCoupon = (cartObj, couponCode, outletId) => {
    const cartItems = cartObj.cart_items;
    let response = {
        "valid": false,
        "message": COUPON_CODE_INVALID,
        "discount": 0.0,
        "cashback": 0.0
    };

    let coupon = {};

    for(let i = 0; i < availableCoupons.length; i=i+1) {
        if(availableCoupons[i].code === couponCode){
            coupon = availableCoupons[i];
            break;
        }
    };

    let result = checkValidCoupon(coupon, outletId);
    if(result.status === false){
        response.message = result.message;
        return response;
    }

    if (coupon.type === COUPON_TYPE_BOGO) {
        return handleBOGO(cartItems, coupon, response);
    } else if (coupon.type === COUPON_TYPE_PERCENTAGE) {
        return handlePercentage(cartItems, coupon, response);
    } else if (coupon.type === COUPON_TYPE_DISCOUNT) {
        return handleDiscount(cartItems, coupon, response);
    } else if (coupon.type === COUPON_TYPE_PERCENTAGE_AND_CASHBACK) {
        return handlePercentAndCashback(cartItems, coupon, response);
    } else if (coupon.type === COUPON_TYPE_DISCOUNT_AND_CASHBACK) {
        return handleDiscountAndCashback(cartItems, coupon, response);
    } else return response;
}
