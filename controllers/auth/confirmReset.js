const Resets = require("./../../models/Resets");
const Users = require("./../../models/User");

async function confimReset(req, res) {
  let key = req.params.key;
  let request = await Resets.findOne({
    confirm: key,
    valid: true
  });
  if (request) {
    let user = await Users.findOne({ _id: request.userId });
    if (user) {
      user.password = request.newPassword;
      request.valid = false;
      await user.save();
      await request.save();
    } else {
      console.log("No user found!");
    }

    res.redirect("/");
  }
}

module.exports = confimReset;
