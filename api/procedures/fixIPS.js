//This is the management cycle for orders.
const mongoose = require("mongoose");
const moment = require("moment");
const Orders = require("./../../models/Orders");
const request = require("request");
const Servers = require("./../../models/Server");

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:901/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let inUse = [];
  let m = await Orders.find({ status: 1 });
  m.forEach((order) => {
    let p = order.proxies.split("\n");
    inUse = inUse.concat(p);
  });

  let serverList = await Servers.find({});

  serverList.forEach(async (server) => {
    console.log(` ${server.alias} - ${server.vaccantAmount}`);
    let vaccant = 0;
    server.ips.forEach((ipObj) => {
      if (inUse.includes(ipObj.ip)) {
        ipObj.used = true;
      } else {
        ipObj.used = false;
        console.log(ipObj.ip);
        vaccant++;
      }
    });
    server.vaccantAmount = vaccant;
    await server.save();
    console.log(` ${server.alias} - ${server.vaccantAmount}`);
  });
}

manager();

module.exports = manager;
