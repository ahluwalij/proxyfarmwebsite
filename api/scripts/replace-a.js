//This is the management cycle for orders.
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const _ = require("lodash");

const server_id = "5e7a62a091ce327d09f9b870";

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let ips_down = fs
    .readFileSync("server1_down.txt", { encoding: "utf-8" })
    .split("\n");

  let ips_up = fs
    .readFileSync("server1_in.txt", { encoding: "utf-8" })
    .split("\n");

  if (ips_down.length == ips_up.length) {
    let serverIps = await Servers.findOne({
      _id: server_id,
    });

    let currentServer = serverIps.ips;

    currentServer.forEach((serverIp) => {
      if (ips_down.includes(serverIp.ip)) {
        let newIp = ips_up.pop();
        console.log(`Inserted new ip => ${newIp}`);
        serverIp.ip = newIp;
      }
    });

    serverIps.markModified("ips");
    await serverIps.save();
  } else {
    console.log("IPS length do not match");
  }
}

manager();
