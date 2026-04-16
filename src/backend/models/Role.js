import mongoose from "mongoose";
import { ROLE_OPTIONS } from "@/backend/constants/roles";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ROLE_OPTIONS,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300
    },
    permissions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
