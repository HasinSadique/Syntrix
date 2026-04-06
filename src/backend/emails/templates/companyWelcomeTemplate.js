export function companyWelcomeTemplate(data = {}) {
  const { companyName, adminName, message } = data;

  return `
    <div style="font-family: Arial, sans-serif; color: #0F172A;">
      <h2 style="color: #1E3A8A;">Welcome to Syntrix</h2>
      <p>Hi ${adminName || "Admin"},</p>
      <p>Your company <strong>${companyName || "your company"}</strong> has been registered.</p>
      <p>${message || "You can now log in and start managing your NDIS operations."}</p>
      <p>Regards,<br/>Syntrix Team</p>
    </div>
  `;
}
