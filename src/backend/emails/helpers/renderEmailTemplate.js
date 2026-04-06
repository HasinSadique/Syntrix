import { companyWelcomeTemplate } from "@/backend/emails/templates/companyWelcomeTemplate";
import { staffWelcomeTemplate } from "@/backend/emails/templates/staffWelcomeTemplate";
import { incidentAlertTemplate } from "@/backend/emails/templates/incidentAlertTemplate";
import { participantUpdateTemplate } from "@/backend/emails/templates/participantUpdateTemplate";

const templates = {
  companyWelcome: companyWelcomeTemplate,
  staffWelcome: staffWelcomeTemplate,
  incidentAlert: incidentAlertTemplate,
  participantUpdate: participantUpdateTemplate,
};

export function renderEmailTemplate(templateName, data) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }
  return template(data);
}
