import bcrypt from "bcryptjs";
import { repositories } from "@/backend/repositories";
import { sendEmail } from "@/backend/services/emailService";
import { emailSubjects } from "@/backend/emails/helpers/emailSubjects";

const { companyRepository, userRepository, superAdminRepository } = repositories;

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  async registerCompany(payload) {
    const {
      companyName,
      abn = "",
      companyEmail,
      phone,
      address,
      adminFullName,
      adminEmail,
      adminPassword,
    } = payload;

    if (
      !companyName ||
      !companyEmail ||
      !phone ||
      !address ||
      !adminFullName ||
      !adminEmail ||
      !adminPassword
    ) {
      const error = new Error("Missing required registration fields");
      error.status = 400;
      throw error;
    }

    const existingCompany = await companyRepository.getCompanyByEmail(companyEmail);
    if (existingCompany) {
      const error = new Error("Company email already exists");
      error.status = 409;
      throw error;
    }

    const existingAdmin = await userRepository.getUserByEmail(adminEmail);
    if (existingAdmin) {
      const error = new Error("Admin email already exists");
      error.status = 409;
      throw error;
    }

    const company = await companyRepository.createCompany({
      companyName,
      abn,
      email: companyEmail,
      phone,
      address,
      status: "active",
      createdBy: "self_registration",
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await userRepository.createUser({
      companyId: company.id,
      fullName: adminFullName,
      email: adminEmail,
      password: hashedPassword,
      phone,
      role: "company_admin",
      status: "active",
    });

    await sendEmail({
      to: adminEmail,
      subject: emailSubjects.companyWelcome,
      templateName: "companyWelcome",
      data: {
        companyName,
        adminName: adminFullName,
        message: "Your company has been registered successfully.",
      },
    });

    return {
      company,
      adminUser: sanitizeUser(adminUser),
    };
  },

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    if (user.status !== "active") {
      const error = new Error("User account is inactive");
      error.status = 403;
      throw error;
    }

    const company = await companyRepository.getCompanyById(user.companyId);
    if (!company || company.status !== "active") {
      const error = new Error("Company is not active");
      error.status = 403;
      throw error;
    }

    return {
      user: sanitizeUser(user),
      redirectPath: "/dashboard",
    };
  },

  async loginSuperadmin({ email, password }) {
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    const superAdmin = await superAdminRepository.getByEmail(email);
    if (!superAdmin) {
      const error = new Error("Invalid superadmin credentials");
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid superadmin credentials");
      error.status = 401;
      throw error;
    }

    return {
      user: sanitizeUser(superAdmin),
      redirectPath: "/superadmin-dashboard",
    };
  },
};
