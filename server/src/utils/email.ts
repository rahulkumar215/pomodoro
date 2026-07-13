import nodemailer from "nodemailer";

interface MailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
}

const sendEmail = (options: MailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rk83029014@gmail.com",
      pass: "tfha uiuu rwhk tqiy",
    },
  });

  const mailOptions = {
    from: "Rahul Vishwakarma <rk83029014@gmail.com>",
    to: options.email,
    subject: options.subject,
    ...(options.message && { text: options.message }),
    ...(options.html && { html: options.html }),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) throw error;
  });
};

export default sendEmail;
