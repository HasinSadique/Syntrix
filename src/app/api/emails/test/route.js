import { sendEmail } from "@/backend/services/emailService";
import { errorResponse, successResponse } from "@/backend/utils/response";

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, templateName = "companyWelcome", data = {} } = body;
    if (!to) return errorResponse("Recipient email is required", 400);

    await sendEmail({
      to,
      subject: body.subject || "Syntrix Test Email",
      templateName,
      data,
    });

    return successResponse(null, "Test email sent");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
