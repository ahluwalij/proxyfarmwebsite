const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ServerSchema = new Schema({
  controller: {
    type: String,
    required: true
  },
  alias: {
    type: String,
    required: true
  },
  port: {
    type: String,
    required: true
  },
  authToken: {
    type: String,
    required: true
  },
  serverType: {
    type: Number,
    default: 0,
    index: true
  },
  ips: [{ ip: String, used: Boolean }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  vaccantAmount: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model("Servers", ServerSchema);
