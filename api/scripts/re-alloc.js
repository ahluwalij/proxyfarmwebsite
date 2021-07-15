const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const Orders = require("../../models/Orders");
const allocate = require("../../api/procedures/allocate.js");

async function manager() {
  let users = [];
  const serverId = "5e5ef0f1468bc425b6c502f2";
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:9091/platinium", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let orders = await Orders.find({
    servers: "5f0676a327d5a20de435616f",
    status: { $in: [1, 2] },
    fulfilled: false,
  });

  for (order of orders) {
    // order.fulfilled = false;
    // order.save();
    let val = await allocate(order._id);
    console.log(order._id);
  }
}

manager();
