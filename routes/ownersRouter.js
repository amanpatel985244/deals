const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");
const orderModel = require("../models/order-model");

// Middleware
router.use(express.urlencoded({ extended: true }));

// Owner Registration Page
router.get("/register", (req, res) => {
  res.render("owner-register", { error: "" });
});

// Owner Registration Logic
router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;
  const existing = await ownerModel.findOne({ email });
  if (existing) return res.render("owner-register", { error: "Owner already exists." });

  await ownerModel.create({ fullname, email, password });
  res.redirect("/owner/login");
});

// Owner Login Page
router.get("/login", (req, res) => {
  res.render("owner-login", { error: req.flash("error") || "" });
});

// Owner Login Logic
router.post("/create", async (req, res) => {
  const { email, password } = req.body;
  const owner = await ownerModel.findOne({ email, password });
  if (!owner) return res.status(401).send("Invalid credentials");

  const token = jwt.sign({ id: owner._id }, "secret");
  res.cookie("ownerToken", token);
  res.redirect("/owner/dashboard");
});

// ✅ Middleware to protect routes
function isOwnerLoggedIn(req, res, next) {
  const token = req.cookies.ownerToken;
  if (!token) return res.redirect("/owner/login");

  try {
    const decoded = jwt.verify(token, "secret");
    req.ownerId = decoded.id;
    next();
  } catch (err) {
    return res.redirect("/owner/login");
  }
}

// Owner Dashboard
router.get("/dashboard", isOwnerLoggedIn, async (req, res) => {
  try {
    const owner = await ownerModel.findById(req.ownerId);
    const products = await productModel.find({ owner: req.ownerId });

    res.render("createproducts", {
      owner,
      products,
      success: req.flash("success") || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
});

// View My Products (Owner Only)
// ✅ View My Products (Owner Only)
router.get("/products/my", isOwnerLoggedIn, async (req, res) => {
  try {
    const owner = await ownerModel.findById(req.ownerId);
    if (!owner) {
      console.log("❌ Owner not found");
      return res.status(404).send("Owner not found");
    }

    const products = await productModel.find({ owner: req.ownerId });

    res.render("owner-myproducts", {
      owner,
      products,
      success: req.flash("success") || ""
    });
  } catch (err) {
    console.error("❌ Error loading your products:", err);
    res.status(500).send("Error loading your products");
  }
});

// router.get("/received", isOwnerLoggedIn, async (req, res) => {
//   try {
//     const ownerId = req.ownerId.toString();
   

//     const allOrders = await orderModel.find()
//       .populate("products.product")
//       .populate("products.owner")
//       .populate("user")
//       .exec();



//     const receivedOrders = [];

//     for (const order of allOrders) {


//       const ownerProducts = order.products.filter(p => {
//         const pid = p.owner?._id?.toString();
        
//         return pid === ownerId;
//       });

//       if (ownerProducts.length > 0) {
//         receivedOrders.push({
//           _id: order._id,
//           buyer: order.user,
//           address: order.address,
//           paymentStatus: order.paymentStatus,
//           paymentMode: order.paymentMode,
//           products: ownerProducts,
//           createdAt: order.createdAt
//         });
//       }
//     }


//     res.render("owner-received-orders", { receivedOrders });
//   } catch (err) {
//     console.error("Error loading received orders:", err);
//     res.status(500).send("Something went wrong.");
//   }
// });


module.exports = router;
