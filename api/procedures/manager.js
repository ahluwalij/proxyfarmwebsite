//This is the management cycle for orders.
const mongoose = require("mongoose");
const moment = require("moment");
const Orders = require("./../../models/Orders");
const request = require("request");
const Servers = require("./../../models/Server");
const discord = require("discord.js");

const hook = new discord.WebhookClient(
  "703638451752534108",
  "G5jslJ2S19mDd-08KdgZ1_-KidkdoZATWmnv4wTTYf25XhP7J6fMLuZvjBlC3QKzv2cg"
);

function removeUser(controller, auth, username, password) {
  var options = {
    method: "POST",
    url: `${controller}/removeuser`,
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

  console.log("Remove user");
  console.log({ controller, auth, username, password });
}

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:27017/arrow2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  const findRenewing = moment().add(7, "days").startOf("day");

  const today = moment();

  let orders = await Orders.find({
    endDate: {
      $lte: findRenewing,
    },
    status: {
      $ne: 0,
    },
  });

  // console.log(orders);

  //For each order
  let serversList = await Servers.find({});

  for (let order of orders) {
    if (moment(today).isAfter(order.endDate)) {
      console.log(order);

      console.log(`order ${order._id} has expired and needs to be killed!`);

      //set the order to expired
      order.status = 0;

      // Now disable the username on the servers this order was on.

      let servers = serversList.filter((serv) =>
        order.servers.includes(serv.id)
      );
      const proxies = order.proxies.split("\n");

      servers.forEach(async (server) => {
        removeUser(
          server.controller,
          server.authToken,
          order.proxyUser,
          order.proxyUserPassword
        );

        let vaccant = 0;
        server.ips.forEach((ip) => {
          if (proxies.includes(ip.ip)) {
            ip.used = false;
          }
          if (ip.used == false) {
            vaccant++;
          }
        });

        server.vaccantAmount = vaccant;
        server.markModified("ips");

        console.log("done!");
      });
      hook.send(
        `[EXPIRY LOG]\n
        **ORDER ID**  ${order.id}
        **SERVER TYPE** ${order.serverType}
        **PROXY AMOUNT** ${order.proxyAmount}`
      );
      await order.save();
    } else {
      //Check here
      if (order.status == 1) {
        console.log(`${order._id} set to renew!`);
        order.status = 2;
        await order.save();
      }
    }
  }

  for (let server of serversList) {
    await server.save();
  }

  // orders.forEach(async (order) => {
  //   if (moment(today).isAfter(order.endDate)) {
  //     console.log(`order ${order._id} has expired and needs to be killed!`);

  //     //set the order to expired
  //     order.status = 0;

  //     // Now disable the username on the servers this order was on.

  //     let servers = serversList.filter((serv) =>
  //       order.servers.includes(serv.id)
  //     );
  //     const proxies = order.proxies.split("\n");

  //     servers.forEach(async (server) => {
  //       removeUser(
  //         server.controller,
  //         server.authToken,
  //         order.proxyUser,
  //         order.proxyUserPassword
  //       );

  //       let vaccant = 0;
  //       server.ips.forEach((ip) => {
  //         if (proxies.includes(ip.ip)) {
  //           ip.used = false;
  //         }
  //         if (ip.used == false) {
  //           vaccant++;
  //         }
  //       });

  //       server.vaccantAmount = vaccant;
  //       server.markModified("ips");

  //       console.log("done!");
  //     });
  //     hook.send(
  //       `[EXPIRY LOG]\n
  //       **ORDER ID**  ${order.id}
  //       **SERVER TYPE** ${order.serverType}
  //       **PROXY AMOUNT** ${order.proxyAmount}`
  //     );
  //     await order.save();
  //   } else {
  //     //Check here
  //     if (order.status == 1) {
  //       console.log(`${order._id} set to renew!`);
  //       order.status = 2;
  //       await order.save();
  //     }
  //   }
  // });

  // serversList.forEach((server) => {
  //   server.save();
  // });
}

if (require.main == module) {
  setInterval(manager, 1000 * 60 * 60 * 2);
  manager();
}

module.exports = manager;
