const nodemailer = require("nodemailer");
const mandrillTransport = require('nodemailer-mandrill-transport');
const MANDRILL_KEY = process.env.MANDRILL_KEY;

let transport = nodemailer.createTransport(mandrillTransport({
  auth: {
    apiKey: MANDRILL_KEY
  }
}));

async function sendMail(options) {
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transport.sendMail(message);

  console.log("Message sent: %s", info.messageId);
}


module.exports = sendMail;