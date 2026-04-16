import mongoose from "mongoose";

const participantBudgetSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
      index: true
    },
    categoryName: {
      type: String,
      required: true,
      trim: true
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    usedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingAmount: {
      type: Number,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

participantBudgetSchema.pre("validate", function normalizeRemainingAmount() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    throw new Error("endDate must be after or equal to startDate");
  }

  const computedRemaining = this.allocatedAmount - this.usedAmount;
  this.remainingAmount = Math.max(computedRemaining, 0);
});

participantBudgetSchema.index(
  { companyId: 1, participantId: 1, categoryName: 1, startDate: -1 },
  { unique: true }
);
participantBudgetSchema.index({ companyId: 1, participantId: 1, endDate: 1 });

export const ParticipantBudget =
  mongoose.models.ParticipantBudget ||
  mongoose.model("ParticipantBudget", participantBudgetSchema);
