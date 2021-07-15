const User = require("../../models/User");
const md5 = require("md5");
const setSession = require("./setSession");

async function login(req, res) {
  if (req.body.email && req.body.password) {
    const id = await User.check(
      req.body.email,
      md5("ARWIO39042I4" + req.body.password)
    );
    if (id !== false) {
      setSession(req, id, req.body.email);
      return res.redirect("/");
    } else {
      return res.render("index", {
        error: "Email and password do not match any account"
      });
    }
  } else {
    res.render("index", { error: "" });
  }
}

module.exports = login;
