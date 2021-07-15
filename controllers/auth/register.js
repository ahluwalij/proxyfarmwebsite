const User = require("./../../models/User");
var md5 = require("md5");
var validator = require("email-validator");

const setSession = require("./setSession");

async function regiser(req, res) {
  if (req.body.email && req.body.password && req.body.confirm) {
    if (req.body.password !== req.body.confirm) {
      return res.render("register", { error: "Passwords do not match" });
    }

    if (req.body.tos != "on") {
      return res.render("register", { error: "You must accept the tos!" });
    }

    if (req.body.password.length < 5) {
      return res.render("register", {
        error: "Passwords should be atleast 5 characters long",
      });
    }

    if (req.body.email) {
      if (!validator.validate(req.body.email)) {
        return res.render("register", {
          error: "Invalid Email",
        });
      }
    }
    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const id = await User.createUser(
      req.body.email,
      md5("ARWIO39042I4" + req.body.password),
      ip
    );
    if (id !== false) {
      setSession(req, id, req.body.email);
      return res.redirect("/");
    } else {
      return res.render("register", { error: "Email already registed" });
    }
  }
}

module.exports = regiser;
