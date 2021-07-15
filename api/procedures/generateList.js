//This is the management cycle for orders.
const mongoose = require("mongoose");
const moment = require("moment");
const Orders = require("./../../models/Orders");
const request = require("request");
const Servers = require("./../../models/Server");

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:9091/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let m = await Orders.find({ serverType: 0, status: { $in: [1, 2] } });
  m.forEach((order) => {
    console.log(`${order.proxyUser}:${order.proxyUserPassword}`);
  });
}

manager();

module.exports = manager;
