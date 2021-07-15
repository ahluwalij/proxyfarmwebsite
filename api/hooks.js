const discord = require("discord.js");

const hook = new discord.WebhookClient(
  "683522819354656798",
  "ZoabKoi_6Hp0qZio_JulJFFEnjqUu4GkPqLoamirgbU__GMZeMcE2hgIymGrDCdNklzV"
);

const renew = new discord.WebhookClient(
  "703638556262006864",
  "TOPujy88wgo-2GIGfWIHR19Lo5bzdyf-jb72Z3q_AnBoA4YYsJKHLkduXz5LQ8_67IzL"
);

function serverMadeHook({ alias, port, totalAmount }) {
  const embed = new discord.RichEmbed()
    .title("New server added")
    .addField("Alias", alias)
    .addField("Port", port)
    .addField("Total IPs", totalAmount)
    .addFooter("Arrow Dashboard | @Dying#0001");
}

function PurchaseHook({ id, email, planName, stockLeft, discount, method }) {
  // const embed = new discord.RichEmbed()
  //   .setTitle("New order recieved!")
  //   .addField("User Id", id, true)
  //   .addField("Email", email, false)
  //   .addField("Discount", discount, false)
  //   .setColor(4842881)
  //   .addField("PlanName", planName, true)
  //   .addField(
  //     "Admin Actions",
  //     `[Check payment method on stripe](https://dashboard.stripe.com/test/search?query=${method})`
  //   )
  //   .setFooter(
  //     "Arrow Dashboard | @Dying#0001",
  //     "https://arrowproxies.com/Images/2x/Asset%201@2x.png"
  //   );
  // hook.send(embed);
}

function RenewHook({ id, email, planName, discount, method }) {
  // const embed = new discord.RichEmbed()
  //   .setTitle("New order recieved!")
  //   .addField("User Id", id, true)
  //   .addField("Email", email, false)
  //   .addField("Discount", discount, false)
  //   .setColor(4842881)
  //   .addField("PlanName", planName, true)
  //   .addField(
  //     "Admin Actions",
  //     `[Check payment method on stripe](https://dashboard.stripe.com/test/search?query=${method})`
  //   )
  //   .setFooter(
  //     "Arrow Dashboard | @Dying#0001",
  //     "https://arrowproxies.com/Images/2x/Asset%201@2x.png"
  //   );
  // renew.send(embed);
}

module.exports.ph = PurchaseHook;
module.exports.rh = RenewHook;
