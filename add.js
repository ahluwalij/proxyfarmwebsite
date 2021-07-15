
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("/models/Server");
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

  let ips = fs.readFileSync("newips.txt", { encoding: "utf-8" }).split("\n");

  let serverIps = await Servers.findOne({
    _id: server_id,
  });

  ips.forEach((ip) => {
    serverIps.ips.push({
      ip,
      used: false,
    });
  });

  serverIps.vaccantAmount += ips.length;
  serverIps.totalAmount += ips.length;
  serverIps.markModified("ips");
  await serverIps.save();
}

manager();
