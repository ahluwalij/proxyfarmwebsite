const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  discordId: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  discordUsername: {
    type: String,
  },
  discordImage: {
    type: String,
    required: true,
  },
  stripeCustomer: {
    type: String,
    required: false,
  },
  ip: {
    type: String,
    required: false,
  },
});

UserSchema.statics.check = async function (email, password) {
  const result = await this.findOne({
    email,
    password,
  });

  console.log(result);
  if (result) return result._id;

  return false;
};

UserSchema.statics.createUser = async function (email, password, ip) {
  const user = new this({
    email,
    password,
    ip,
  });

  try {
    await user.save();
    return user._id;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = mongoose.model("Users", UserSchema);
