const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
  planName: {
    type: String,
    required: true,
    unique: true,
    index: true,
    ref: "planName"
  },
  planDuration: {
    type: Number,
    required: true,
    default: 30
  },
  proxyQuantity: {
    type: Number,
    required: true
  },
  planPrice: {
    type: Number,
    required: true
  },
  serverType: {
    type: Number,
    default: 0,
    index: true
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
  public: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model("Products", ProductsSchema);
