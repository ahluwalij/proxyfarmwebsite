//This is the management cycle for orders.
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const Orders = require("../../models/Orders");
const _ = require("lodash");

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:9091/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let orders = await Orders.find({
    servers: "5e7a6f0c91ce327d09f9c16c",
    status: { $in: [1, 2] },
  });

  let total = 0;
  orders.forEach((order) => {
    if (order.servers.length == 1) {
      order.fulfilled = false;
      order.save();
    }
  });

  console.log(total);
}

manager();
