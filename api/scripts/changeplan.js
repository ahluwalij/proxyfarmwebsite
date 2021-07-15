const mongoose = require("mongoose");
const fs = require("fs");
const Servers = require("../../models/Server");
const Orders = require("../../models/Orders");
const allocate = require("../../api/procedures/allocate.js");

let ips = `198.228.79.189
198.228.79.188
198.228.79.187
198.228.79.186
198.228.79.185
198.228.79.184
198.228.79.183
198.228.79.182
198.228.79.181
198.228.79.180
198.228.79.179
198.228.79.178
198.228.79.177
198.228.79.176
198.228.79.175
198.228.79.174
198.228.79.173
198.228.79.172
198.228.79.171
198.228.79.170
198.228.79.169
198.228.79.168
198.228.79.167
198.228.79.166
198.228.79.165
198.228.79.164
198.228.79.163
198.228.79.162
198.228.79.40
198.228.79.41
198.228.79.42
198.228.79.43
198.228.79.44
198.228.79.45
198.228.79.46
198.228.79.47
198.228.79.48
198.228.79.49
198.228.79.50
198.228.79.51
198.228.79.52
198.228.79.53
198.228.79.54
198.228.79.55
198.228.79.56
198.228.79.57
198.228.79.58
198.228.79.59
198.228.79.60
198.228.79.61`.split("\n");

async function manager() {
  let users = [];
  const orderId = "5ee2c4c29570a00599185747";
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:9091/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  let order = await Orders.updateOne(
    {
      _id: orderId,
    },
    {
      proxies: ips.join("\n"),
    }
  );
  console.log(order);
}

manager();
