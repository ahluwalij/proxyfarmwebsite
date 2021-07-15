//This is the management cycle for orders.
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const _ = require("lodash");

const server_id = "5e5ef0f1468bc425b6c502f2";

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:9091/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let used = [];
  let server = await Servers.findOne({
    _id: server_id,
  });

  server.ips.forEach((ip) => {
    if (!ip.used) {
      used.push(ip.ip);
    }
  });

  let usedIps = used.join("\n");
  fs.writeFileSync("unused-verizon.txt", usedIps);
}

manager();
