const mongoose = require("mongoose");
const Orders = require("./../../models/Orders");
const Servers = require("./../../models/Server");
let short = require("short-uuid");
const request = require("request");

function makeUser(controller, auth, username, password) {
  var options = {
    method: "POST",
    url: `${controller}/makeuser`,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authToken: auth,
      username: username,
      password: password,
    }),
  };
  request(options, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      if (response) {
        console.log(response.body);
      }
    }
  });
}

async function allocate(orderId) {
  //First fetch the plan this belongs to
  const order = await Orders.findOne({ _id: orderId });
  if (order) {
    //Now lets extract some useful values
    const proxyAmount = order.proxyAmount;
    //the number of proxies to be alloacted
    const [proxyUser, proxyPass] = new Array(2)
      .fill(0)
      .map((k) => short.generate().toLowerCase().substring(0, 8));

    //Lets find the servers that have vacant ips needed
    const allocatingServers = await Servers.find({
      vaccantAmount: { $gte: 0 },
      serverType: order.serverType,
    });

    order.servers = [];
    if (allocatingServers) {
      //Find the ips this user will be allocated
      const allocatedIps = [];
      let index = 0;

      while (
        allocatedIps.length < proxyAmount &&
        index < allocatingServers.length
      ) {
        const currentServer = allocatingServers[index];
        let findIps = currentServer.ips.filter((x) => !x.used);

        if (currentServer.vaccantAmount >= proxyAmount - allocatedIps.length) {
          findIps = findIps.slice(0, proxyAmount - allocatedIps.length);
        } else {
          findIps = findIps.slice(0, currentServer.vaccantAmount);
        }

        if (findIps.length > 0) {
          order.servers.push(currentServer._id);
          makeUser(
            currentServer.controller,
            currentServer.authToken,
            proxyUser,
            proxyPass
          );
        }

        findIps.forEach((ip) => {
          allocatedIps.push(ip.ip);
          ip.used = true;
        });

        currentServer.markModified("ips");
        currentServer.vaccantAmount -= findIps.length;
        await currentServer.save();
        index++;
      }

      order.fulfilled = true;
      order.proxies = allocatedIps.join("\n") || "CONTACT SUPPORT";

      order.proxyUser = proxyUser;
      order.proxyUserPassword = proxyPass;

      order.markModified("servers");
      await order.save();
      console.log(`Successfully fullfilled order no ${orderId}`);
      return true;
    } else {
      console.log(
        `FATAL ERROR OCCURED WHILE ALLOCATING NOT ENOUGH PROXIES FOR ${orderId}`
      );
    }
  }
}

module.exports = allocate;
