//This is the management cycle for orders.
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const _ = require("lodash");

const server_id = "";

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let ips = fs
    .readFileSync("server1_down.txt", { encoding: "utf-8" })
    .split("\r\n");

  let serverIps = await Servers.findOne({
    _id: server_id,
  });

  let found = [];
  let currentServer = serverIps.ips;

  currentServer.forEach((serverIp) => {
    if (ips.includes(serverIp.ip)) {
      found.push(serverIp.ip);
    }
  });

  //Find difference
  let ipsNotIn = _.difference(ips, found);
  console.log(ipsNotIn);
}

manager();
