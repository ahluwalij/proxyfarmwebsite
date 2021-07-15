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
  console.log(`${orderId} is ready to be allocated`);
}

module.exports = allocate;
