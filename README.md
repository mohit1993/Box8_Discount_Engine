Box8 Recruitment - Discount Engine Code

This code is for Box8 Discount Coupon Computation Engine using Javascript.

Filename is prog.js

It has the applyCoupon function, that takes cart_items, coupon_code and outlet_id as input.

Following steps are performeed by the function:

    1. First a for loop is executed to find the details of the relevent coupon from the availableCoupons array. Which is assumed to be available for the system to run from database, api or anyother resource. For the sake of current code, it is declared empty at the top of the file.

    2. checkValidCoupon function takes coupon and outlet_id as input. If coupon was not found in the previous for loop then coupon will be an empty object and this function will return a relevent response. Else the function will check the coupon for active state, valid start_date, end_date and applicable outlet ids if available.

    3. Incase the checkValidCoupon passes the status as True, then applicable type of coupon based function will be called. Each function calculates totalAmount of the cartitems, and discount applicable on the cart. If applicable discount is more than the maximum discount then maximum discount is applied and if the remaining cart amount is less than required than error is thrown.
    else if all conditions are met, the relevent discount amount and cashback are mentioned and response is sent.