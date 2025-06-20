const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      quantity: Number,
      owner: { type: mongoose.Schema.Types.ObjectId,
        ref: "owner",
      }, 
      price: Number,        // ✅ add these
      discount: Number      // ✅ add these
    }
  ],
  address: {
    line1: String,
    city: String,
    state: String,
    zip: String,
  },
  total: Number,
  paymentStatus: {
    type: String,
    enum: ["cod", "paid"],
  },
  paymentMode: String,
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);
