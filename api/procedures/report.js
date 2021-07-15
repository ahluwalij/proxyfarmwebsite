//This is the management cycle for orders.
const mongoose = require("mongoose");
const moment = require("moment");
const Orders = require("./../../models/Orders");
const request = require("request");
const Servers = require("./../../models/Server");
const discord = require("discord.js");

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });
  let orders = await Orders.find({ status: 1 });
  orders.forEach((order) => {
    console.log(
      `${order.planId} ${order.planName} ${order.proxyAmount} ${order.discount}`
    );
  });
}

if (require.main == module) {
  setInterval(manager, 1000 * 60 * 60 * 2);
  manager();
}

module.exports = manager;
