const fs = require("fs");
//This is the management cycle for orders.
const mongoose = require("mongoose");

const Servers = require("../../models/Server");
const Orders = require("../../models/Orders");
const _ = require("lodash");

let k = fs.readFileSync("./verizonvac.csv", "utf-8");

let m = k.split("\r\n");

async function manager() {
  let users = [];
  const serverId = "5e5ef0f1468bc425b6c502f2";
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhos/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let server = await Servers.findOne({ _id: serverId });

  m.forEach((i) => {
    let o = i.split(",");
    if (o.length > 1) {
      let ip = o[0];
      users.push(ip);
    }
  });

  let count = 0;
  server.ips.forEach((ip) => {
    if (!ip.used && users.includes(ip.ip)) {
      ip.used = true;
    }

    if (!ip.used) {
      count++;
    }
  });

  server.vaccantAmount = count;

  server.save();
}

manager();
