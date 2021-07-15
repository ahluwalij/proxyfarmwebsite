const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

global.LIVE = true;
app.use(cors());

const { ph } = require("./api/hooks");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

const stripe = require("stripe")("sk_live_WgmG0ji7OE3qeOf5XGlkTTBH00S9d3HgD4");

const API = require("./api/root");
const Admin = require("./api/admin/admin.js");

app.use("/api", API);
app.use("/sfth", Admin);
const loginController = require("./controllers/auth/login");
const registerController = require("./controllers/auth/register");

mongoose
  .connect("mongodb://localhost:27017/arrowaioprod", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  })
  .catch(error => handleError(error));

const Products = require("./models/Products.js");
const Order = require("./models/Orders");

const allocationAlgorithm = require("./api/procedures/allocate");

const Discounts = require("./models/Discounts");

app.get("/", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.render("index", { error: "" });
  }
  return res.render("main");
});

app.get("/register", (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  res.render("register", { error: "" });
});

app.get("/stripe-key", (req, res) => {
  res.send({ publishableKey: "pk_live_NlhSZdbBpr0H4qd9vzhvsXyX00piRzRWWF" });
});

app.get("/discount/:code", async (req, res) => {
  const code = req.params.code;
  if (code) {
    let data = await Discounts.check(code);
    return res.json(data);
  } else {
    return res.json({ valid: false, amount: 0 });
  }
});

app.post("/login", loginController);
app.post("/register", registerController);
app.get("/logout", (req, res) => {
  req.session.userId = undefined;
  req.session.email = "";
  req.session.admin = false;
  return res.redirect("/");
});

app.get("/buy/:plan", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  try {
    const plan = await Products.findOne({ _id: req.params.plan });
    if (plan && plan.stock > 0) {
      return res.render("buy", { item: plan.planName });
    }
  } catch (e) {
    return res.redirect("/");
  }
});

app.get("/purchase", async (req, res) => {
  if (LIVE) {
    const publicProds = await Products.find({ public: true }).sort({
      proxyQuantity: "asc"
    });

    const totalStock = publicProds.reduce((prev, curr) => prev + curr.stock, 0);
    if (totalStock === 0) {
      LIVE = false;
      console.log("Sold Out!");
    }

    res.render("purchase", { publicProds });
  } else {
    res.render("oos");
  }
});
//PAY    ------------------------------------------>

app.post("/pay", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  const {
    paymentMethodId,
    paymentIntentId,
    items,
    discount,
    useStripeSdk
  } = req.body;

  try {
    let intent;
    if (paymentMethodId) {
      const plan = await Products.findOne({ planName: items[0] });
      console.log(plan);
      if (plan && plan.stock > 0) {
        let orderAmount = plan.planPrice;
        if (discount) {
          let Ddata = await Discounts.check(discount);
          if (Ddata.valid) {
            req.session.discount = discount;
            orderAmount = orderAmount - Ddata.amount * orderAmount;
          }
        }

        intent = await stripe.paymentIntents.create({
          amount: orderAmount * 100,
          currency: "usd",
          payment_method: paymentMethodId,
          confirmation_method: "manual",
          confirm: true,
          use_stripe_sdk: useStripeSdk
        });

        await Products.updateOne({ _id: plan._id }, { $inc: { stock: -1 } });
        req.session.buying = items[0];
        req.session.price = orderAmount * 100;
      } else {
        return res.json({
          error:
            "Too slow! We just ran out of stock. Don't worry you'll get several more opportunities, life is full of them ;)"
        });
      }
      // After create, if the PaymentIntent's status is succeeded, fulfill the order.
    } else if (paymentIntentId) {
      // Confirm the PaymentIntent to finalize payment after handling a required action
      // on the client.
      intent = await stripe.paymentIntents.confirm(paymentIntentId);
      // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
    }

    const gennedResp = await generateResponse(intent, req, res);
    res.send(gennedResp);
  } catch (e) {
    res.send({ error: e.message });
    console.log(e);
  }
});

const generateResponse = async (intent, req, res) => {
  // Generate a response based on the intent's status
  const planName = req.session.buying;
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret
      };
    case "requires_payment_method":
    case "requires_source":
    case "payment_failed":
      // Card was not properly authenticated, suggest a new payment method

      await Products.updateOne({ planName }, { $inc: { stock: 1 } });
      return {
        error: "Your card was denied, please provide a new payment method"
      };
    case "succeeded":
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log("Payment received!");

      //Reduce stock
      //find the plan they purhcased

      const plan = await Products.findOne({ planName });

      console.log(plan);
      //Provision for stock over here.

      const userId = req.session.userId;

      const today = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(today.getDate() + plan.planDuration);

      const newOrder = new Order({
        planName: plan.planName,
        planId: plan._id,
        userId: userId,
        proxyAmount: plan.proxyQuantity,
        status: 1,
        startDate: today,
        endDate: expiryDate
      });

      await newOrder.save();
      await allocationAlgorithm(newOrder._id);
      ph({
        id: userId,
        planName,
        email: req.session.email,
        discount: req.session.discount ? req.session.discount : "NILL",
        method: intent.payment_method
      });
      return { clientSecret: intent.client_secret };
    default:
      break;
    //Allocate the purchase
  }
};

app.get("/renew/:id", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const orderId = req.params.id;

  if (orderId) {
    let order = await Order.findOne({ _id: orderId });
    if (order.status === 2) {
      //render the renew view
      res.render("renew", { item: orderId });
    }
  }
});

app.post("/renew", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }
  const { paymentMethodId, paymentIntentId, items, useStripeSdk } = req.body;

  try {
    let intent;
    if (paymentMethodId) {
      const order = await Order.findOne({ _id: items[0] });
      const plan = await Products.findOne({ _id: order.planId });
      if (order.status === 2) {
        const orderAmount = plan.planPrice;
        intent = await stripe.paymentIntents.create({
          amount: orderAmount * 100,
          currency: "usd",
          payment_method: paymentMethodId,
          confirmation_method: "manual",
          confirm: true,
          use_stripe_sdk: useStripeSdk
        });

        req.session.buying = items[0];
        req.session.price = orderAmount * 100;
      } else {
        return res.json({
          error:
            "Too slow! We just ran out of stock. Don't worry you'll get several more opportunities, life is full of them ;)"
        });
      }
      // After create, if the PaymentIntent's status is succeeded, fulfill the order.
    } else if (paymentIntentId) {
      // Confirm the PaymentIntent to finalize payment after handling a required action
      // on the client.
      intent = await stripe.paymentIntents.confirm(paymentIntentId);
      // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
    }

    const gennedResp = await generateResponseRenew(intent, req, res);
    res.send(gennedResp);
  } catch (e) {
    res.send({ error: e.message });
    console.log(e);
  }
});

const generateResponseRenew = async (intent, req, res) => {
  // Generate a response based on the intent's status
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret
      };
    case "requires_payment_method":
    case "requires_source":
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: "Your card was denied, please provide a new payment method"
      };
    case "succeeded":
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log("Payment received!");
      //Reduce stock
      //find the plan they purhcased
      const orderId = req.session.buying;
      const order = await Order.findOne({ _id: orderId });
      order.status = 1;
      var date = new Date();
      date.setDate(order.endDate.getDate() + 30);
      order.endDate = date;
      await order.save();

      return { clientSecret: intent.client_secret };
    default:
      break;
    //Allocate the purchase
  }
};

//PAY    ------------------------------------------>

// app.use((req, res) => {
//   return res.redirect("/");
// });

app.listen(80, () => {
  console.log("Running server on port 80");
});
