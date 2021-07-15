const mongoose = require("mongoose");
const Order = require("../../models/Orders");
const Products = require("../../models/Products");
const moment = require("moment");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });
  await createOrder("5e790559a63f013df452a5a9");
})();

async function createOrder(orderId) {
  const order = await Order.findOne({ _id: orderId });

  if (order) {
    const planData = await Products.findOne({ _id: order.planId });

    order.status = 1;

    order.endDate = moment(order.endDate).add(planData.planDuration, "days");

    await order.save();
  }
}
