const Resets = require("./../../models/Resets");
const Users = require("./../../models/User");
let short = require("short-uuid");
var md5 = require("md5");
let uuid = require("uuid/v4");
const nodemailer = require("nodemailer");

async function forgotHandler(req, res) {
  if (req.body.email) {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      let password = short.generate();
      let key = uuid();
      let request = new Resets({
        userId: user._id,
        confirm: key,
        newPassword: md5("ARWIO39042I4" + password)
      });
      await request.save();
      nodeMailer(req.body.email, password, key).catch(console.log);
      res.render("forgot", {
        error: "Email sent! Please check your email."
      });
    } else {
      res.render("forgot", {
        error: "No account exists with the given email!"
      });
    }
  }
}

async function nodeMailer(email, password, code) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "no-reply@arrowsupport.tech", // generated ethereal user
      pass: "ArrowAIO123!ZZX" // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Arrow Support" <no-reply@arrowsupport.tech>', // sender address
    to: email, // list of receivers
    subject: "Reset your Arrow password", // Subject line
    text: `<b>Dear User,</b>\r\n
    Your request to reset your arrow password has been processed. If you did not make this request please ignore this request.
    \r\n
    \r\n
    Confirmation link : https://dash.arrowproxies.com/reset/${code}\r\n\r\n
    After confirming your new password will be <b>${password}</b>
    `,
    html: `<b>Dear User,</b>\r\n
    Your request to reset your arrow password has been processed. If you did not make this request please ignore this request.
    \r\n
    \r\n    
    Confirmation link : https://dash.arrowproxies.com/reset/${code}\r\n
    After confirming your new password will be <b>${password}</b>
    ` // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = forgotHandler;
