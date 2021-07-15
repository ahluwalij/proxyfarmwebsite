const mongoose = require("mongoose");
const Order = require("../../models/Orders");
const Product = require("../../models/Products");
const allocate = require("../../api/procedures/allocate.js");

const userId = "5ebd7a7f4d304a0e6c1268b2";
const planId = "5ebd7c244d304a0e6c1268b3";

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });
  await createOrder();
  // await allocate("5e790559a63f013df452a5a9");
})();

async function createOrder() {
  //First find the planID
  const plan = await Product.findOne({
    _id: planId,
  });
  if (plan) {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 1);

    const newOrder = new Order({
      planName: plan.planName,
      planId: planId,
      userId: userId,
      proxyAmount: plan.proxyQuantity,
      status: 1,
      startDate: today,
      endDate: expiryDate,
      fulfilled: true,
      proxyUserPassword: "aka",
      proxyUser: "mka",
      proxies: `127.0.0.1\n127.0.0.2\n127.0.0.3`,
    });

    const final = await newOrder.save();
    console.log(final);
  }
}
