import { connectToDatabase } from "@/backend/db/mongoose";
import { comparePassword } from "@/backend/auth/password";
import { signAccessToken } from "@/backend/auth/jwt";
import { ROLE_LABELS, ROLES } from "@/backend/constants/roles";
import { Company, User } from "@/backend/models";

export async function authenticateUser({ email, password }) {
  await connectToDatabase();

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({
    email: normalizedEmail,
    status: "active"
  })
    .select("+passwordHash")
    .populate("roleId", "name description permissions");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  if (!user.roleId?.name) {
    throw new Error("User role assignment is invalid");
  }

  if (user.roleId.name !== ROLES.SUPER_ADMIN) {
    const company = await Company.findById(user.companyId).select("status").lean();
    if (!company || company.status !== "active") {
      throw new Error(
        "Your company access is deactivated. Please contact Syntrix Super Admin."
      );
    }
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken({
    sub: user._id.toString(),
    companyId: user.companyId ? user.companyId.toString() : null,
    role: user.roleId.name
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      companyId: user.companyId ? user.companyId.toString() : null,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.roleId.name,
      roleLabel: ROLE_LABELS[user.roleId.name] || user.roleId.name,
      permissions: user.roleId.permissions || []
    }
  };
}
