export function staffWelcomeTemplate(data = {}) {
  const { staffName, companyName, role, temporaryPassword } = data;

  return `
    <div style="font-family: Arial, sans-serif; color: #0F172A;">
      <h2 style="color: #1E3A8A;">Your Syntrix account is ready</h2>
      <p>Hello ${staffName || "Team Member"},</p>
      <p>You have been added to <strong>${companyName || "your company"}</strong> as a <strong>${role || "staff member"}</strong>.</p>
      <p>Temporary password: <strong>${temporaryPassword || "Please contact your admin"}</strong></p>
      <p>Please sign in and update your password.</p>
    </div>
  `;
}
