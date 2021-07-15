const express = require("express");
const api = express.Router();

const Orders = require("./../models/Orders");

function isAuthed(req, res, next) {
  if (req.user && req.user._id) {
    next();
  } else {
    res.json({
      error: "Unauthenitcated",
      code: 403,
    });
  }
}

api.get("/orders", isAuthed, async (req, res) => {
  if (req.user) {
    const getOrders = await Orders.getSummary(req.user._id);
    return res.json({
      orders: getOrders,
      user: req.user,
    });
  }
});

api.get("/me", isAuthed, (req, res) => {
  res.json({
    id: req.session.userId,
  });
});

api.get("/proxies/:order", isAuthed, async (req, res) => {
  const orderRef = req.params.order;
  if (!orderRef) {
    return res.json({
      error: "Invalid request",
    });
  } else {
    const proxies = await Orders.getProxies(orderRef, req.user._id);
    if (proxies) {
      let toSend = Object.assign({}, proxies[0]);
      toSend.proxies = toSend.proxies
        .split("\n")
        .map((k) => `${k}:65243`)
        .join("\n");

      return res.json([toSend]);
    }
  }
});

api.get("/download/:order", isAuthed, async (req, res) => {
  const orderRef = req.params.order;
  if (!orderRef) {
    return res.json({
      error: "Invalid request",
    });
  } else {
    const proxies = (await Orders.getProxies(orderRef, req.user._id))[0];

    let prox = proxies.proxies.split("\n");
    prox = prox.map(
      (proxy) =>
        `${proxy}:65243:${proxies.proxyUser}:${proxies.proxyUserPassword}`
    );
    prox = prox.join("\r\n");
    res.set({
      "Content-Disposition": `attachment; filename="${Date.now()}.txt"`,
    });
    res.send(prox);
  }
});

module.exports = api;
