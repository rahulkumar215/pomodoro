import appConfig from "@/config";
import { ExternalServiceError } from "@/errors";
import nodemailer from "nodemailer";

interface MailOptions {
  email: string;
  subject: string;
  message?: string;
  html?: string;
}

// Fail fast instead of hanging on nodemailer's ~2 minute default, so a blocked
// or unreachable SMTP host surfaces as a prompt error rather than a stalled
// request.
const SMTP_TIMEOUT_MS = 10_000;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: appConfig.EMAIL_USERNAME,
    pass: appConfig.EMAIL_PASSWORD,
  },
  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS,
});

const sendEmail = async (options: MailOptions) => {
  try {
    await transporter.sendMail({
      from: `${appConfig.EMAIL_NAME} <${appConfig.USER_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      ...(options.message && { text: options.message }),
      ...(options.html && { html: options.html }),
    });
  } catch (cause) {
    // Awaited by the caller, so this reaches the Express error handler rather
    // than escaping as an uncaught exception and killing the process.
    throw new ExternalServiceError("email", cause);
  }
};

export default sendEmail;
