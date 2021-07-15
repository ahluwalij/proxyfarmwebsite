const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrdersSchema = new Schema({
  userId: {
    type: Schema.ObjectId,
    required: true,
    index: true,
    ref: "userId",
  },
  planId: {
    type: Schema.ObjectId,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  proxyAmount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  proxies: {
    type: String,
    required: true,
    default: "-",
  },
  discount: {
    type: Number,
    default: 0,
  },
  proxyUser: {
    type: String,
    required: true,
    default: "-",
  },
  serverType: {
    type: Number,
    required: true,
    default: 0,
  },
  fulfilled: {
    type: Boolean,
    default: false,
    index: true,
  },
  proxyUserPassword: {
    type: String,
    required: true,
    default: "-",
  },
  server: {
    type: Schema.ObjectId,
    required: false,
  },
  servers: {
    type: [Schema.ObjectId],
    default: [],
  },
});

OrdersSchema.statics.getSummary = async function (userId) {
  return this.find(
    { userId: userId },
    "planId planName proxyAmount startDate endDate status"
  );
};

OrdersSchema.statics.getProxies = async function (orderId, userId) {
  return this.find(
    { _id: orderId, userId: userId },
    "proxies proxyUser proxyUserPassword"
  ).lean();
};

module.exports = mongoose.model("Orders", OrdersSchema);
