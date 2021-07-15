require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const moment = require("moment");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const rp = require("request-promise");

const { setupUser } = require("./services/user");

global.LIVE = true;
global.PASSWORD = "";
app.use(cors());

const { ph, rh } = require("./api/hooks");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());
//app.use((req,res) => {
//	res.render('down');
//});

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://discord.com/api/oauth2/authorize",
      tokenURL: "https://discord.com/api/oauth2/token",
      clientID: "827569848086822924",
      clientSecret: "0m0uhQRKPjmnrIWv1Y2TUanTwGKKEeh1",
      callbackURL: process.env.CALLBACK,
    },
    async function (accessToken, refreshToken, profile, cb) {
      console.log(accessToken);

      try {
        let userData = await rp(`https://discord.com/api/users/@me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        let user = await setupUser(JSON.parse(userData));
        cb(null, user);
      } catch (e) {
        cb(e, null);
      }

      // User.findOrCreate({ exampleId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const stripe = require("stripe")(process.env.STRIPE_PRIVATE);

const API = require("./api/root");
const Admin = require("./api/admin/admin.js");

app.use("/api", API);
app.use("/sfth", Admin);
const loginController = require("./controllers/auth/login");
const registerController = require("./controllers/auth/register");
const forgotController = require("./controllers/auth/forgot");
const confirmResetController = require("./controllers/auth/confirmReset");

mongoose
  .connect("mongodb://localhost:27017/proxyfarm", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .catch((error) => handleError(error));

const Products = require("./models/Products.js");
const Order = require("./models/Orders");

const allocationAlgorithm = require("./api/procedures/allocate");

const Discounts = require("./models/Discounts");
const Orders = require("./models/Orders");

app.get("/", async (req, res) => {
  console.log(req.user);
  if (!req.user || !req.user.discordId) {
    return res.render("index", { error: "" });
  }

  console.log(req.user);
  let buys = await Orders.find({
    userId: req.user._id,
  }).lean();
  return res.render("main", { ...req.user, buys });
});

app.get("/resi", (req, res) => {
  if (!req.user || !req.user.discordId) {
    return res.render("index", { error: "" });
  } else {
    return res.render("resi", { ...req.user });
  }
});

app.get(
  "/login",
  passport.authenticate("oauth2", { scope: ["email", "identify"] })
);

app.get(
  "/auth",
  passport.authenticate("oauth2", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.

    res.redirect("/");
  }
);

app.get("/stripe-key", (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLIC });
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

app.post("/forgot", forgotController);
app.get("/reset/:key", confirmResetController);
app.get("/logout", (req, res) => {
  req.logOut();
  return res.redirect("/");
});

app.get("/buy/:plan", async (req, res) => {
  if (!req.user || !req.user.discordId) {
    return res.redirect("/");
  }
  try {
    console.log(req.user);
    const plan = await Products.findOne({ _id: req.params.plan });
    if (plan && plan.stock > 0) {
      return res.render("buy", {
        item: plan.planName,
        price: plan.planPrice,
        user: req.user,
      });
    }
  } catch (e) {
    return res.redirect("/");
  }
});

app.get("/success", async (req, res) => {
  if (!req.user || !req.user.discordId) {
    return res.redirect("/");
  } else {
    return res.render("success");
  }
});

app.post("/password", async (req, res) => {
  if (req.body.password) {
    if (req.body.password === global.PASSWORD) {
      req.session.password = global.PASSWORD;
      res.redirect("/purchase");
    } else {
      res.redirect("/password");
    }
  }
});

app.get("/password", async (req, res) => {
  if (!global.PASSWORD) {
    return res.redirect("/purchase");
  }

  if (req.user && req.user.discordId) {
    res.render("password", { user: req.user });
  } else {
    res.redirect("/");
  }
});

app.get("/purchase", async (req, res) => {
  if (!req.user || !req.user.discordId) {
    return res.redirect("/");
  }

  const publicProds = await Products.find({ public: true });

  if (LIVE) {
    if (global.PASSWORD && global.PASSWORD !== req.session.password) {
      return res.redirect("/password");
    }

    console.log(publicProds);

    const totalStock = publicProds.reduce((prev, curr) => prev + curr.stock, 0);
    if (totalStock === 0) {
      LIVE = false;
      console.log("Sold Out!");
    }

    res.render("purchase", { publicProds, user: req.user });
  } else {
    let modified = publicProds.map((k) => {
      k.stock = 0;
      return k;
    });
    res.render("purchase", { publicProds: modified, user: req.user });
  }
});
//PAY    ------------------------------------------>

app.post("/pay", async (req, res) => {
  //If the user is trying to maliciously pay without passowrd redirect them back.
  if (global.PASSWORD && global.PASSWORD !== req.session.password) {
    console.log("NO PASSWORD");
    return res.redirect("/");
  }

  if (!req.user || !req.user.discordId) {
    return res.redirect("/");
  }
  const { paymentMethodId, paymentIntentId, items, discount, useStripeSdk } =
    req.body;

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
            req.session.discount = Ddata.amount;
            orderAmount = orderAmount - Ddata.amount * orderAmount;
            console.log("Discount applied");
          } else {
            return res.json({
              error: "Invalid discount code entered!",
            });
          }
        }

        const plan2 = await Products.findOne({ planName: items[0] });

        if (plan2.stock > 0) {
          await Products.updateOne({ _id: plan._id }, { $inc: { stock: -1 } });

          try {
            intent = await stripe.paymentIntents.create({
              amount: parseInt(orderAmount * 100),
              currency: "usd",
              payment_method: paymentMethodId,
              confirmation_method: "manual",
              confirm: true,
              receipt_email: req.user.email,
              use_stripe_sdk: useStripeSdk,
              customer: req.user.stripeCustomer,
              description: "Anonymous Proxy Service",
            });

            req.session.buying = items[0];
            req.session.price = orderAmount * 100;
          } catch (e) {
            console.log(e);
            await Products.updateOne({ _id: plan._id }, { $inc: { stock: 1 } });
          }
        } else {
          return res.json({
            error:
              "Very close! We just ran out of stock. Don't worry you'll get several more opportunities, life is full of them ;)",
          });
        }
      } else {
        return res.json({
          error:
            "Too slow! We just ran out of stock. Don't worry you'll get several more opportunities, life is full of them ;)",
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
  console.log(intent);
  const planName = req.session.buying;
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret,
      };
    case "requires_payment_method":
    case "requires_source":
    case "payment_failed":
      // Card was not properly authenticated, suggest a new payment method

      await Products.updateOne({ planName }, { $inc: { stock: 1 } });
      return {
        error: "Your card was denied, please provide a new payment method",
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

      const userId = req.user._id;

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
        serverType: plan.serverType,
        discount: req.session.discount || 0,
        endDate: expiryDate,
      });

      await newOrder.save();
      await allocationAlgorithm(newOrder._id);

      ph({
        id: userId,
        planName,
        email: req.session.email,
        discount: req.session.discount ? req.session.discount : "NILL",
        method: intent.payment_method,
      });

      req.session.discount = undefined;
      return { clientSecret: intent.client_secret };
    default:
      break;
    //Allocate the purchase
  }
};

app.get("/renew/:id", async (req, res) => {
  if (!req.user || !req.user.discordId) {
    return res.redirect("/");
  }

  const orderId = req.params.id;

  if (orderId) {
    let order = await Order.findOne({ _id: orderId });

    if (order.status === 2) {
      //render the renew view
      let plan = await Products.findOne({ _id: order.planId });
      res.render("renew", {
        item: orderId,
        discount: order.discount,
        price: plan.planPrice,
        name: plan.planName,
        user: req.user,
      });
    } else {
      return res.redirect("/");
    }
  }
});

app.post("/renew", async (req, res) => {
  if (!req.user || !req.user.discordId) {
    return res.redirect("/");
  }

  const { paymentMethodId, paymentIntentId, items, useStripeSdk } = req.body;

  try {
    let intent;
    if (paymentMethodId) {
      const order = await Order.findOne({ _id: items[0] });
      const plan = await Products.findOne({ _id: order.planId });

      if (order.severType == 0 || order.serverType == 3) {
        return;
      }

      if (order.status === 2) {
        const discnt = order.discount || 0;
        const orderAmount = plan.planPrice - discnt * plan.planPrice;
        intent = await stripe.paymentIntents.create({
          amount: parseInt(orderAmount * 100),
          currency: "usd",
          payment_method: paymentMethodId,
          confirmation_method: "manual",
          receipt_email: req.session.email,
          confirm: true,
          use_stripe_sdk: useStripeSdk,
        });

        req.session.buying = items[0];
        req.session.price = orderAmount * 100;
      } else {
        return res.json({
          error: "You can no longer renew this plan!",
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

app.get("/store", async (req, res) => {
  res.render("store");
});

const generateResponseRenew = async (intent, req, res) => {
  // Generate a response based on the intent's status
  switch (intent.status) {
    case "requires_action":
    case "requires_source_action":
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret,
      };
    case "requires_payment_method":
    case "requires_source":
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: "Your card was denied, please provide a new payment method",
      };
    case "succeeded":
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log("Payment received!");
      //Reduce stock
      //find the plan they purhcased
      const orderId = req.session.buying;
      const order = await Order.findOne({ _id: orderId });

      if (order) {
        const planData = await Products.findOne({ _id: order.planId });

        order.status = 1;

        order.endDate = moment(order.endDate).add(
          planData.planDuration,
          "days"
        );
        rh({
          id: order.userId,
          planName: order.planName,
          email: req.session.email,
          discount: order.discount || "NULL",
          method: intent.payment_method,
        });
        await order.save();
      }

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

// app.listen(80, "206.189.236.243", () => {
//   console.log("Running server on port 80");
// });

app.listen(80, () => {
  console.log("Running server on port 80");
});
