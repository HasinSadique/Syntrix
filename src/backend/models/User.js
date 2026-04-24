import mongoose from "mongoose";
import { ROLES } from "@/backend/constants/roles";

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 70
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 70
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500
    },
    state: {
      type: String,
      enum: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

userSchema.virtual("fullName").get(function getFullName() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("validate", function ensureTenantForNonSuperAdmin() {
  const roleName = this.populated("roleId")
    ? this.roleId?.name
    : this.$locals?.roleName;

  if (roleName && roleName !== ROLES.SUPER_ADMIN && !this.companyId) {
    throw new Error("companyId is required for non-super-admin users");
  }
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

userSchema.index({ companyId: 1, status: 1 });
userSchema.index({ companyId: 1, roleId: 1 });
userSchema.index({ companyId: 1, state: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
