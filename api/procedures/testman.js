//This is the management cycle for orders.
const mongoose = require("mongoose");
const moment = require("moment");
const Orders = require("./../../models/Orders");
const request = require("request");
const Servers = require("./../../models/Server");

function removeUser(controller, auth, username, password) {
  var options = {
    method: "POST",
    url: `${controller}/removeuser`,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      authToken: auth,
      username: username,
      password: password
    })
  };
  request(options, function(error, response) {
    console.log(response.body);
  });

  console.log("Remove user");
  console.log({ controller, auth, username, password });
}

async function manager() {
  console.log("Manager ran!");
  await mongoose.connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  });

  const findRenewing = moment()
    .add(7, "days")
    .startOf("day");

  const today = moment()
    .add(0, "days");


  let orders = await Orders.find({
    endDate: {
      $lte: findRenewing
    },
    status: {
      $ne: 0
    }
  });

  console.log(orders);
  //For each order

  orders.forEach(async order => {
    if (moment(today).isAfter(order.endDate)) { 
      console.log(`order ${order._id} has expired and needs to be killed!`);
    } else {
      //Check here
      if (order.status == 1) {
        console.log(`${order._id} set to renew!`);
        order.status = 2;
        await order.save();
      }
    }
  });
}

setInterval(manager, 1000 * 60 * 60 * 2);
manager();
