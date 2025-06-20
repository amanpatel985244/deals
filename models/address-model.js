const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  line1: String,
  city: String,
  state: String,
  zip: String,
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);
