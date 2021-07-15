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

  let batch = await Orders.find({
    $or: [
      {
        servers: serverId,
        status: 1,
      },
      {
        servers: serverId,
        status: 2,
      },
    ],
  });

  for (let ord of batch) {
    users.push(`${ord.proxyUser}:${ord.proxyUserPassword}`);
  }

  fs.writeFileSync("./finalusers.txt", users.join("\r\n"));
}

manager();
