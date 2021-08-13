const mongoose = require("mongoose");
const Orders = require("./../../models/Orders");
const Storage = require("./../../models/Storage");
const Servers = require("./../../models/Server");
let short = require("short-uuid");
const request = require("request");

// function makeUser(controller, auth, username, password) {
//   var options = {
//     method: "POST",
//     url: `${controller}/makeuser`,
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       authToken: auth,
//       username: username,
//       password: password,
//     }),
//   };
//   request(options, function (error, response) {
//     if (error) {
//       console.log(error);
//     } else {
//       if (response) {
//         console.log(response.body);
//       }
//     }
//   });
// }

async function allocate(orderId) {
  //First fetch the plan this belongs to
  const order = await Orders.findOne({ _id: orderId });

  if (order) {
    let storedProxies = await Storage.findOne({
      qualityIndex: order.serverType,
      count: { $gte: order.proxyAmount },
    });

    //If enough proxies are stored.
    if (storedProxies) {
      storedProxies.count = storedProxies.count - order.proxyAmount;
      let fulfillingProxies = storedProxies.ips.splice(0, order.proxyAmount);
      storedProxies.markModified("ips");
      await storedProxies.save();
      order.proxies = fulfillingProxies.join("\n");
      order.fulfilled = true;
      await order.save();
    }
  }

  console.log(`${orderId} is ready to be allocated`);
}

module.exports = allocate;
