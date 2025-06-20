// routes/productsRouter.js

const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const ownerModel = require("../models/owner-model");
const multer = require("multer");
const upload = multer();
const jwt = require("jsonwebtoken");

// ✅ Middleware to check owner is logged in
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

// ✅ Create product
router.post("/create", isOwnerLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

    const product = await productModel.create({
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      image: req.file?.buffer,
      owner: req.ownerId,
    });

    await ownerModel.findByIdAndUpdate(req.ownerId, {
      $push: { products: product._id },
    });

    req.flash("success", "Product created successfully!");
    res.redirect("/owner/dashboard");
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).send("Failed to create product.");
  }
});

// ✅ Show edit form
router.get("/edit/:id", isOwnerLoggedIn, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product || product.owner.toString() !== req.ownerId) {
      return res.status(403).send("Unauthorized");
    }
    res.render("edit-product", { product });
  } catch (err) {
    console.error("Edit Form Error:", err);
    res.status(500).send("Failed to load edit form.");
  }
});

// ✅ Handle edit
router.post("/edit/:id", isOwnerLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

    const updatedData = {
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    };

    if (req.file) {
      updatedData.image = req.file.buffer;
    }

    const updated = await productModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.ownerId },
      updatedData
    );

    if (!updated) {
      return res.status(404).send("Product not found or unauthorized.");
    }

    res.redirect("/owner/products/my");
  } catch (err) {
    console.error("Edit Submit Error:", err);
    res.status(500).send("Failed to update product.");
  }
});

// ✅ Delete product
router.post("/delete/:id", isOwnerLoggedIn, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product || product.owner.toString() !== req.ownerId) {
      return res.status(403).send("Unauthorized");
    }

    await productModel.deleteOne({ _id: req.params.id });

    await ownerModel.findByIdAndUpdate(req.ownerId, {
      $pull: { products: req.params.id },
    });

    res.redirect("/owner/products/my");
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).send("Failed to delete product.");
  }
});

module.exports = router;
