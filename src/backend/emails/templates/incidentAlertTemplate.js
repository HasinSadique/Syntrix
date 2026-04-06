export function incidentAlertTemplate(data = {}) {
  const { companyName, participantName, workerName, incidentType, severity, description } = data;

  return `
    <div style="font-family: Arial, sans-serif; color: #0F172A;">
      <h2 style="color: #F97316;">Incident Alert</h2>
      <p>An incident has been submitted in ${companyName || "your company"}.</p>
      <ul>
        <li><strong>Participant:</strong> ${participantName || "Unknown"}</li>
        <li><strong>Worker:</strong> ${workerName || "Unknown"}</li>
        <li><strong>Type:</strong> ${incidentType || "N/A"}</li>
        <li><strong>Severity:</strong> ${severity || "N/A"}</li>
      </ul>
      <p><strong>Description:</strong> ${description || "No description provided."}</p>
    </div>
  `;
}
