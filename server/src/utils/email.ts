import appConfig from "@/config";
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
      user: appConfig.EMAIL_USERNAME,
      pass: appConfig.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `${appConfig.EMAIL_NAME} <${appConfig.USER_EMAIL}>`,
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
