import bcrypt from "bcryptjs";
import { repositories } from "@/backend/repositories";
import { sendEmail } from "@/backend/services/emailService";
import { emailSubjects } from "@/backend/emails/helpers/emailSubjects";

const { userRepository, companyRepository } = repositories;

function sanitize(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export const userService = {
  async listCompanyUsers(companyId, filters = {}) {
    const users = await userRepository.listUsersByCompany(companyId, filters);
    return users.map(sanitize);
  },

  async createCompanyUser(companyId, payload) {
    const { fullName, email, phone, role, status = "active", password } = payload;
    if (!fullName || !email || !phone || !role || !password) {
      const error = new Error("Missing required user fields");
      error.status = 400;
      throw error;
    }

    const existing = await userRepository.getUserByEmail(email);
    if (existing) {
      const error = new Error("User email already exists");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await userRepository.createUser({
      companyId,
      fullName,
      email,
      phone,
      role,
      status,
      password: hashedPassword,
    });

    const company = await companyRepository.getCompanyById(companyId);
    await sendEmail({
      to: email,
      subject: emailSubjects.staffWelcome,
      templateName: "staffWelcome",
      data: {
        staffName: fullName,
        companyName: company?.companyName,
        role,
        temporaryPassword: password,
      },
    });

    return sanitize(created);
  },

  async updateUserStatus(companyId, userId, status) {
    const user = await userRepository.getUserById(userId);
    if (!user || user.companyId !== companyId) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    const updated = await userRepository.updateUser(userId, { status });
    return sanitize(updated);
  },
};
