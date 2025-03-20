const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_LOGIN,
      pass: process.env.SMTP_PASSWORD,
    },
  });

async function sendEmail(toEmail, subject, htmlContent) {
    try {
        await transport.sendMail({
            from: process.env.SMTP_LOGIN,
            sender: "Nischay",
            to: toEmail,
            subject: subject,
            text: htmlContent,
          });
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
}
module.exports = sendEmail;