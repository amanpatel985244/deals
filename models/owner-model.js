const mongoose = require("mongoose");

const ownerSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,

  picture: String,
  gstin: String,

  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product"
    }
  ],

  receivedOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order" // this references the order model
    }
  ]
});

module.exports = mongoose.model("owner", ownerSchema);
