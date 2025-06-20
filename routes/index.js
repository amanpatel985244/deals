const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');
const addressModel = require('../models/address-model');

// Homepage
router.get("/", (req, res) => {
  let error = req.flash("error");
  res.render("index", { error, loggedin: false });
});

// Shop page
router.get("/shop", isLoggedIn, async (req, res) => {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success });
});

// Cart page
router.get("/cart", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).populate("cart.product");

    // Clean invalid products
    user.cart = user.cart.filter(item => item.product);
    await user.save();

    const cartProducts = user.cart.map(({ product, quantity }) => ({
      ...product.toObject(),
      quantity: quantity || 1
    }));

    let totalMRP = 0, discount = 0;
    cartProducts.forEach(p => {
      totalMRP += (p.price || 0) * p.quantity;
      discount += (p.discount || 0) * p.quantity;
    });

    let platformFee = cartProducts.length > 0 ? 40 : 0;
    let shippingFee = totalMRP > 500 ? 0 : 40;

    res.render("cart", {
      cartProducts,
      totalMRP,
      discount,
      platformFee,
      shippingFee
    });
  } catch (err) {
    console.error("Cart loading error:", err);
    res.status(500).send("Something went wrong!");
  }
});

// Add to cart
router.get("/addtocart/:productid", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  const pid = req.params.productid;

  let found = false;
  for (let item of user.cart) {
    if (item.product && item.product.equals(pid)) {
      item.quantity += 1;
      found = true;
      break;
    }
  }

  if (!found) {
    user.cart.push({ product: pid, quantity: 1 });
  }

  await user.save();
  req.flash("success", "Added to cart");
  res.redirect("/cart");
});

// Increment quantity
router.get("/cart/increase/:productid", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  for (let item of user.cart) {
    if (item.product && item.product.equals(req.params.productid)) {
      item.quantity += 1;
      break;
    }
  }
  await user.save();
  res.redirect("/cart");
});

// Decrement quantity
router.get("/cart/decrease/:productid", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  for (let i = 0; i < user.cart.length; i++) {
    if (user.cart[i].product && user.cart[i].product.equals(req.params.productid)) {
      user.cart[i].quantity -= 1;
      if (user.cart[i].quantity <= 0) {
        user.cart.splice(i, 1);
      }
      break;
    }
  }
  await user.save();
  res.redirect("/cart");
});

// Remove product
router.get("/cart/remove/:productid", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({ email: req.user.email });
  user.cart = user.cart.filter(item => item.product && !item.product.equals(req.params.productid));
  await user.save();
  res.redirect("/cart");
});

// Checkout page
router.get("/checkout", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart.product")
      .populate("addresses"); // ✅ Populate addresses

    if (!user || user.cart.length === 0) {
      return res.redirect("/cart");
    }

  const cartProducts = user.cart.map(({ product, quantity }) => {
  const p = product.toObject();
  return {
    ...p,
    quantity,
    discount: typeof p.discount !== "undefined" ? p.discount : 0,
    price: typeof p.price !== "undefined" ? p.price : 0,
  };
});

    res.render("checkout", {
      user,
      cartProducts
    });
  } catch (err) {
    console.error("Checkout Page Error:", err);
    res.status(500).send("Something went wrong while loading checkout.");
  }
});

// GET Add Address Page
router.get("/address/add", isLoggedIn, (req, res) => {
  res.render("add-address");
});

// POST Save Address
router.post("/address/add", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    const newAddress = await addressModel.create({
      user: user._id,
      line1: req.body.line1,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    });

    if (!user.addresses) user.addresses = [];
    user.addresses.push(newAddress._id);
    await user.save();

    res.redirect("/checkout");
  } catch (err) {
    console.error("Add Address Error:", err);
    res.status(500).send("Failed to add address");
  }
});






// GET Edit Address Page
router.get("/address/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const address = await addressModel.findById(req.params.id);
    if (!address) return res.status(404).send("Address not found");
    res.render("edit-address", { address });
  } catch (err) {
    console.error("Edit Address Page Error:", err);
    res.status(500).send("Something went wrong");
  }
});

// POST Update Address
router.post("/address/edit/:id", isLoggedIn, async (req, res) => {
  try {
    await addressModel.findByIdAndUpdate(req.params.id, {
      line1: req.body.line1,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip
    });
    res.redirect("/checkout");
  } catch (err) {
    console.error("Update Address Error:", err);
    res.status(500).send("Failed to update address");
  }
});

// DELETE Address
router.get("/address/delete/:id", isLoggedIn, async (req, res) => {
  try {
    const address = await addressModel.findById(req.params.id);
    if (!address) return res.status(404).send("Address not found");

    // Remove from user's address list too
    await userModel.updateOne(
      { _id: req.user._id },
      { $pull: { addresses: address._id } }
    );

    await addressModel.findByIdAndDelete(req.params.id);
    res.redirect("/checkout");
  } catch (err) {
    console.error("Delete Address Error:", err);
    res.status(500).send("Failed to delete address");
  }
});


// Logout
router.post("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
