//This is the management cycle for orders.
const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const Orders = require("../../models/Orders");
const _ = require("lodash");

async function manager() {
  let users = [];
  const serverId = "5e5ef0f1468bc425b6c502f2";
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:9091/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let batch = await Servers.findOne({ _id: serverId });
  batch.ips.forEach(async (ip) => {
    if (!ip.used) {
      let reg = new RegExp(`${ip.ip}\n`);
      let cols = [ip.ip];
      console.log(`Finding running packages for ${ip.ip}`);
      let active = await Orders.find({
        proxies: reg,
        status: { $in: [1, 2] },
      });
      console.log(`Found running packages for ${ip.ip}`);
      for (ord of active) {
        cols.push(`${ord._id}:${ord.planName}`);
      }

      let row = cols.join(",");
      console.log(row);
      users.push(row);

      if (users.length == batch.vaccantAmount) {
        console.log("Written File");
        fs.writeFileSync("./verizonvac.csv", users.join("\r\n"));
      }
    }
  });
}

manager();
