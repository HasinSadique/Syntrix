export function participantUpdateTemplate(data = {}) {
  const { participantName, companyName, updateSummary } = data;

  return `
    <div style="font-family: Arial, sans-serif; color: #0F172A;">
      <h2 style="color: #14B8A6;">Participant Update</h2>
      <p>Participant <strong>${participantName || "N/A"}</strong> was updated in ${companyName || "your company"}.</p>
      <p>${updateSummary || "Template scaffold for future participant update notifications."}</p>
    </div>
  `;
}
