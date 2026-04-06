import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    participantId: { type: String, required: true, index: true },
    workerId: { type: String, required: true, index: true },
    noteTitle: { type: String, required: true },
    noteDetails: { type: String, required: true },
    serviceDate: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
