//This is the management cycle for orders.
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const Orders = require("../../models/Orders");
const _ = require("lodash");

const server_id = "5e7a6f0c91ce327d09f9c16c";

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  const old_ips = fs
    .readFileSync("./server2_down.txt", { encoding: "utf-8" })
    .split("\n");

  const to_replace = fs
    .readFileSync("./usedips_2.txt", { encoding: "utf-8" })
    .split("\n");

  let orders = await Orders.find({
    servers: mongoose.Types.ObjectId(server_id),
  });

  console.log(orders);

  orders.forEach(async (order) => {
    let oldProxies = order.proxies.split("\n");
    let newBatch = [];

    //if this proxy is old change it or keep it!
    oldProxies.forEach((proxy) => {
      if (old_ips.includes(proxy)) {
        newBatch.push(to_replace.pop());
      } else {
        newBatch.push(proxy);
      }
    });

    order.proxies = newBatch.join("\n");
    order.markModified("proxies");
    await order.save();
  });

  console.log("Done!");
}

manager();
