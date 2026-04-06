import { getMailer } from "@/backend/config/mailer";
import { renderEmailTemplate } from "@/backend/emails/helpers/renderEmailTemplate";

export async function sendEmail({ to, subject, templateName, data }) {
  if (!to || !subject || !templateName) {
    throw new Error("Missing required email arguments");
  }

  const transporter = getMailer();
  const html = renderEmailTemplate(templateName, data);

  return transporter.sendMail({
    from: process.env.SMTP_FROM || "Syntrix <noreply@syntrix.local>",
    to,
    subject,
    html,
  });
}
