const express = require("express");
const admin = express.Router();
const Servers = require("./../../models/Server.js");
const Orders = require("./../../models/Orders.js");
const Products = require("./../../models/Products.js");
const Users = require("./../../models/User.js");
const Discount = require("../../models/Discounts");
const Manager = require("./../procedures/manager.js");

const basicAuth = require("express-basic-auth");

admin.use(
  basicAuth({
    users: {
      admin: "3qLjasperJSd4LFA2j7ZQ7admin",
    },
    challenge: true,
    realm: "Arrow",
  })
);

function isAdmin(req, res, next) {
  // if (req.session && req.session.admin) {
  //   next();
  // } else {
  //   res.json({
  //     error: "Unauthenitcated",
  //     code: 401,
  //   });
  // }
  next();
}

admin.get("/runloop", isAdmin, async (req, res, next) => {
  Manager();
  res.json({
    status: "Started DB manager loop!",
  });
});

admin.post("/discount", isAdmin, async (req, res, next) => {
  const { code, amount } = req.body;
  if (code && amount) {
    const newDiscount = new Discount({
      code,
      amount: parseFloat(amount),
    });
    await newDiscount.save();
    res.redirect("/sfth/server");
  }
});

admin.get("/newpublic", isAdmin, async (req, res) => {
  const testProduct = new Products({
    planName: `new-${Date.now()}`,
    planDuration: 30,
    proxyQuantity: 50,
    planPrice: 105,
    enabled: true,
    public: true,
  });
  await testProduct.save();
  res.redirect("/sfth/plans");
});

admin.get("/newplan", isAdmin, async (req, res) => {
  const testProduct = new Products({
    planName: `new-${Date.now()}`,
    planDuration: 30,
    proxyQuantity: 50,
    planPrice: 105,
    enabled: true,
    public: false,
  });
  await testProduct.save();
  res.redirect("/sfth/plans");
});

admin.get("/discountdel/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  await Discount.deleteOne({ _id: id });
  res.redirect("/sfth/server");
});

admin.get("/download/:order", isAdmin, async (req, res) => {
  const orderRef = req.params.order;
  if (!orderRef) {
    return res.json({
      error: "Invalid request",
    });
  } else {
    const proxies = await Orders.findOne({ _id: orderRef });

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

admin.get("/daf1666f9649a78b110f15c4mc", async (req, res) => {
  req.session.admin = true;
  return res.redirect("/sfth/server");
});

admin.get("/server", isAdmin, async (req, res) => {
  const orders = await Orders.find({ fulfilled: false }).lean();
  const discounts = await Discount.find().lean();

  res.render("admin/servers", { discounts, orders });
});

admin.get("/users", isAdmin, async (req, res) => {
  const allUsers = await Users.find({}, "email ip").lean();
  res.render("admin/users", { data: allUsers });
});

admin.get("/users/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  if (id) {
    const orders = await Orders.find({ userId: id });
    res.render("admin/usersprod", { user: id, orders });
  }
});

admin.get("/plans", isAdmin, async (req, res) => {
  const servers = await Servers.find({}).lean();
  const products = await Products.find(
    {},
    "planName proxyQuantity planPrice stock public serverType planDuration"
  ).lean();

  const totalProxies = servers.reduce((prev, cur) => {
    return prev + cur.vaccantAmount;
  }, 0);

  const totalStocked = products.reduce((prev, cur) => {
    return prev + cur.stock * cur.proxyQuantity;
  }, 0);

  const publicPlans = products.filter((product) => product.public);
  const customPlans = products.filter((product) => !product.public);

  res.render("admin/plans", {
    totalProxies,
    totalStocked,
    publicPlans,
    customPlans,
  });
});

admin.get("/plans/:id", isAdmin, async (req, res, next) => {
  const id = req.params.id;
  if (id) {
    const product = await Products.findOne({ _id: id }).lean();
    res.render("admin/planeditor", { product, LIVE });
  }
});

admin.post("/setpassword", isAdmin, (req, res) => {
  if (req.body.password) {
    if (req.body.password == "null") {
      PASSWORD = "";
    } else {
      PASSWORD = req.body.password;
    }
    return res.redirect("/sfth/plans");
  }
});

admin.get("/setlive/:to", isAdmin, (req, res) => {
  const to = req.params.to;
  if (to) {
    if (to === "ON") {
      LIVE = true;
    } else {
      LIVE = false;
    }
    res.redirect("/sfth/plans");
  }
});

admin.get("/fulfil/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  if (id) {
    const order = await Orders.findOne({ _id: id }).lean();

    console.log(order);

    return res.render("admin/fulfill", { order });
  }
});

admin.post("/fulfil/:id", isAdmin, async (req, res) => {
  const id = req.params.id;
  if (id) {
    const order = await Orders.updateOne(
      {
        _id: id,
      },
      {
        fulfilled: true,
        proxies: req.body.proxies
          .split("\n")
          .map((k) => k.trim())
          .join("\n"),
      }
    );

    return res.redirect("/sfth/server");
  }
});

admin.post("/plans/:id/update", isAdmin, async (req, res) => {
  const id = req.params.id;
  if (id) {
    let { planName, proxyQuantity, planPrice, stock, quality, planDuration } =
      req.body;

    if (planName && proxyQuantity && planPrice && stock) {
      proxyQuantity = parseInt(proxyQuantity);
      planPrice = parseInt(planPrice);
      planDuration = parseInt(planDuration);

      await Products.updateOne(
        { _id: id },
        {
          planName,
          proxyQuantity,
          planPrice,
          planDuration,
          stock,
          serverType: parseInt(quality),
        }
      );

      res.redirect("/sfth/plans");
    }
  }
});

//Admin make a new server
admin.post("/server", isAdmin, async (req, res) => {
  const { controller, authToken, alias, port, ips, quality } = req.body;
  if (controller && authToken && alias && port && ips) {
    const addrs = ips.split("\r\n").map((k) => ({ ip: k, used: false }));
    try {
      let attempt = await Servers.updateOne(
        { alias },
        {
          alias,
          controller,
          authToken,
          port,
          ips: addrs,
          totalAmount: addrs.length,
          serverType: quality,
          vaccantAmount: addrs.length,
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
      res.json({
        code: 200,
      });
    } catch (e) {
      console.log(e);
      res.json({
        code: 500,
      });
    }
  } else {
    res.json({
      msg: "Error all parameters are required",
    });
  }
});

module.exports = admin;
