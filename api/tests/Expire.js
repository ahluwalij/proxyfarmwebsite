const mongoose = require("mongoose");
const moment = require("moment");
const Order = require("./../../models/Orders");

let orderId = "5e790559a63f013df452a5a9";
(async () => {
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });

  const order = await Order.findOne({ _id: orderId });

  console.log(`order ${order._id} has expired and needs to be killed!`);

  //set the order to expired
  order.status = 0;

  //Now disable the username on the servers this order was on.
  let servers = await Servers.find({
    _id: { $in: order.servers }
  });

  const proxies = order.proxies.split("\n");
  servers.forEach(async server => {
    // removeUser(
    //   server.controller,
    //   server.authToken,
    //   order.proxyUser,
    //   order.proxyUserPassword
    // );

    server.ips.forEach(ip => {
      if (proxies.includes(ip.ip)) {
        ip.used = false;
      }
    });

    let vaccant = server.ips.reduce((accum, cur) => {
      if (!cur.used) {
        return ++accum;
      }
    }, 0);

    server.vaccantAmount = vaccant;
    server.markModified("ips");
    console.log(server.vaccantAmount);
    // await server.save();
  });
  console.log("clean");
  await order.save();
})();

// async function createProduct() {
//   const testProduct = new Product({
//     planName: "Teller",
//     planDuration: 30,
//     proxyQuantity: 50,
//     planPrice: 105,
//     enabled: true,
//     public: true
//   });

//   const result = await testProduct.save();
//   console.log(result);
// }

// (async () => {
//   createProduct();
// })();
