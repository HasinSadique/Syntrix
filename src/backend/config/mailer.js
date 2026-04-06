import nodemailer from "nodemailer";

let transporter;

function createConsoleTransport() {
  return {
    async sendMail(payload) {
      console.log("[Syntrix Mock Email]", {
        to: payload.to,
        subject: payload.subject,
      });
      return { accepted: [payload.to], messageId: `mock-${Date.now()}` };
    },
  };
}

export function getMailer() {
  if (transporter) return transporter;

  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!hasSmtp) {
    transporter = createConsoleTransport();
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}
