const mongoose = require("mongoose");
const Order = require("../../models/Orders");
const Product = require("../../models/Products");

const userId = "5e5a34c5667aa4298c2f7ac6";
const planId = "5e59bccd8eaa3d53dc4985ec";

(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaio2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  await createOrder();
})();

async function createOrder() {
  //First find the planID
  const plan = await Product.findOne({
    servers: ObjectId("5e7a6f0c91ce327d09f9c16c"),
    status: { $in: [1, 2] },
  });
  if (plan) {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + plan.planDuration);

    const newOrder = new Order({
      planName: plan.planName,
      planId: planId,
      userId: userId,
      proxyAmount: plan.proxyQuantity,
      status: 1,
      startDate: today,
      endDate: expiryDate,
    });

    const final = await newOrder.save();
    console.log(final);
  }
}
