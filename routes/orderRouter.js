const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const orderModel = require("../models/order-model");
const addressModel = require("../models/address-model");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

// ✅ Middleware to check if user is logged in
function isUserLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
const decoded = jwt.verify(token, process.env.JWT_KEY);

    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}
function isOwnerLoggedIn(req, res, next) {
  const token = req.cookies.ownerToken;
  if (!token) return res.redirect("/owner/login");

  try {
 const decoded = jwt.verify(token, process.env.EXPRESS_SESSION_SECRET);

    req.ownerId = decoded.id;
    next();
  } catch (err) {
    return res.redirect("/owner/login");
  }
}
// ✅ GET /checkout
router.get("/checkout", isUserLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.userId).populate("cart.product");

  const cartProducts = user.cart.map(item => ({
    ...item.product.toObject(),
    quantity: item.quantity
  }));

  res.render("checkout", {
    user,
    cartProducts
  });
});

// ✅ POST /order/place → Go to payment page
router.post("/place", isUserLoggedIn, async (req, res) => {
  const addressId = req.body.addressId;
  res.render("payment", { addressId });
});

// ✅ POST /order/payment
router.post("/payment", isUserLoggedIn, async (req, res) => {
  try {
    const { addressId, payment } = req.body;
    const user = await userModel.findById(req.userId);

    if (!user || !user.cart.length) return res.status(400).send("No cart items");

    const address = await addressModel.findOne({ _id: addressId, user: req.userId });
    if (!address) return res.status(400).send("Invalid address");

    let products = [];
    let total = 0;

    for (const item of user.cart) {
      const productDoc = await productModel.findById(item.product).populate("owner");
      if (!productDoc) continue;

      products.push({
        product: productDoc._id,
        quantity: item.quantity,
        owner: productDoc.owner // ✅ CORRECTED: store ObjectId or document
      });

      total += ((productDoc.price || 0) - (productDoc.discount || 0)) * item.quantity;
    }

    await orderModel.create({
      user: user._id,
      products,
      address: {
        line1: address.line1,
        city: address.city,
        state: address.state,
        zip: address.zip
      },
      total,
      paymentStatus: payment === "cod" ? "cod" : "paid",
      paymentMode: payment
    });

    user.cart = [];
    await user.save();

    res.render("order-success");
  } catch (err) {
    console.error("Payment Processing Error:", err);
    res.status(500).send("Order failed.");
  }
});

// ✅ GET /orders/my → My Orders page
router.get("/my", isUserLoggedIn, async (req, res) => {
  const orders = await orderModel.find({ user: req.userId })
    .populate("products.product")
    .populate("products.owner") // ✅ To access owner in my-orders.ejs
    .exec();

  res.render("my-orders", { orders });
});


// ✅ Owner-only middleware already exists: isOwnerLoggedIn

router.get("/received", isOwnerLoggedIn, async (req, res) => {
  try {
    const ownerId = req.ownerId.toString();
   

    const allOrders = await orderModel.find()
      .populate("products.product")
      .populate("products.owner")
      .populate("user")
      .exec();



    const receivedOrders = [];

    for (const order of allOrders) {


      const ownerProducts = order.products.filter(p => {
        const pid = p.owner?._id?.toString();
        
        return pid === ownerId;
      });

      if (ownerProducts.length > 0) {
        receivedOrders.push({
          _id: order._id,
          buyer: order.user,
          address: order.address,
          paymentStatus: order.paymentStatus,
          paymentMode: order.paymentMode,
          products: ownerProducts,
          createdAt: order.createdAt
        });
      }
    }


    res.render("owner-received-orders", { receivedOrders });
  } catch (err) {
    console.error("Error loading received orders:", err);
    res.status(500).send("Something went wrong.");
  }
});




module.exports = router;
