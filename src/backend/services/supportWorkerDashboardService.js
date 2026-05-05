import mongoose from "mongoose";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Assignment, Shift } from "@/backend/models";

const participantFields =
  "firstName lastName ndisNumber address primaryDisability medicalAlerts highRiskFlags";

export async function getSupportWorkerDashboardContext(user) {
  await connectToDatabase();

  const companyId = user.activeCompanyId || user.companyId;
  if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
    return { assignments: [], upcomingShifts: [] };
  }

  const companyObjectId = new mongoose.Types.ObjectId(companyId);
  const workerObjectId = new mongoose.Types.ObjectId(user.id);
  const now = new Date();

  const [assignments, upcomingShifts] = await Promise.all([
    Assignment.find({
      companyId: companyObjectId,
      workerUserId: workerObjectId,
      status: "active",
    })
      .sort({ startDate: -1 })
      .populate("participantId", participantFields)
      .lean(),
    Shift.find({
      companyId: companyObjectId,
      workerUserId: workerObjectId,
      status: { $in: ["scheduled", "in_progress"] },
      shiftDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
    })
      .sort({ shiftDate: 1, startTime: 1 })
      .limit(80)
      .populate("participantId", participantFields)
      .lean(),
  ]);

  return {
    assignments,
    upcomingShifts,
  };
}
