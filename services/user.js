const mongoose = require("mongoose");
const Users = require("./../models/User");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE);

async function setupUser(discord) {
  let existingUser = await Users.findOne({ discordId: discord.id }).lean();
  if (!existingUser) {
    let discordImage = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.png?size=64`;

    const customer = await stripe.customers.create({
      description: `${discord.username}#${discord.discriminator}`,
      email: discord.email,
    });

    //Make new stripe customer with this email
    let newUser = new Users({
      email: discord.email,
      discordId: discord.id,
      discordUsername: `${discord.username}#${discord.discriminator}`,
      discordImage,
      stripeCustomer: customer.id,
    });

    await newUser.save();
    return newUser;
  }
  return existingUser;
}

module.exports = {
  setupUser,
};
