const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  line1: String,
  city: String,
  state: String,
  zip: String,
}, { _id: true }); // _id allows selection via `address._id`

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,
  contact: Number,
  picture: String,

  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],

addresses: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Address'
}],


  // Removed `orders` since orders are tracked separately in order model
});

module.exports = mongoose.model("user", userSchema);
