import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Document, Participant, WorkerProfile } from "@/backend/models";
import { SupportSetupForm } from "@/components/participants/support-setup-form";

export default async function ParticipantSupportSetupPage({ params }) {
  const user = await requireRoles([
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
  ]);

  const { participantId } = await params;
  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    notFound();
  }

  await connectToDatabase();
  const participantObjectId = new mongoose.Types.ObjectId(participantId);
  const companyObjectId = new mongoose.Types.ObjectId(user.companyId);

  const participant = await Participant.findOne({
    _id: participantObjectId,
    companyId: companyObjectId,
  }).lean();

  if (!participant) {
    notFound();
  }

  const workers = await WorkerProfile.find({ companyId: companyObjectId })
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("userId", "firstName lastName email state phone status")
    .lean();

  const workerIds = workers.map((w) => w._id);
  const passportPhotos =
    workerIds.length === 0
      ? []
      : await Document.find({
          companyId: companyObjectId,
          entityType: "worker_profile",
          entityId: { $in: workerIds },
          documentType: "passport_photo",
          fileUrl: { $nin: ["", null] },
        })
          .sort({ updatedAt: -1 })
          .lean();

  const photoByWorkerProfileId = new Map();
  for (const doc of passportPhotos) {
    const key = doc.entityId.toString();
    if (!photoByWorkerProfileId.has(key)) {
      photoByWorkerProfileId.set(key, doc.fileUrl);
    }
  }

  const workersWithPhotos = workers.map((w) => ({
    ...w,
    profilePhotoUrl: photoByWorkerProfileId.get(w._id.toString()) || null,
  }));

  const participantPayload = JSON.parse(JSON.stringify(participant));
  const workersPayload = JSON.parse(JSON.stringify(workersWithPhotos));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {" "}
          Support Sessions{" "}
        </h2>{" "}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Configure routine support and assign a worker whose availability
          matches these times.{" "}
        </p>{" "}
      </div>
      <SupportSetupForm
        participantId={participantId}
        participant={participantPayload}
        workers={workersPayload}
        careManagerUserId={user.id}
      />{" "}
    </div>
  );
}
