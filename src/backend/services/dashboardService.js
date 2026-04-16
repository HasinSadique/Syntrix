import mongoose from "mongoose";
import { connectToDatabase } from "@/backend/db/mongoose";
import { ROLES } from "@/backend/constants/roles";
import {
    Company,
    Incident,
    Participant,
    User,
    WorkerProfile,
} from "@/backend/models";

export async function getDashboardStats(currentUser) {
    await connectToDatabase();

    const companyFilter = currentUser.companyId ?
        { companyId: new mongoose.Types.ObjectId(currentUser.companyId) } :
        {};

    const roleMatchers = {
        [ROLES.SUPER_ADMIN]: async() => {
            const [totalCompanies, totalUsers, totalParticipants, totalWorkers] =
            await Promise.all([
                Company.countDocuments({ status: "active" }),
                User.countDocuments({ status: "active" }),
                Participant.countDocuments({ status: "active" }),
                WorkerProfile.countDocuments({}),
            ]);

            const companies = await Company.find({})
                .sort({ createdAt: -1 })
                .limit(8)
                .select("name state status");

            return {
                summary: [
                    { label: "Total companies", value: totalCompanies },
                    { label: "Active users", value: totalUsers },
                    { label: "Participants", value: totalParticipants },
                    { label: "Support Workers", value: totalWorkers },
                ],
                companies: companies.map((company) => ({
                    id: company._id.toString(),
                    name: company.name,
                    state: company.state,
                    status: company.status,
                })),
            };
        },
        default: async() => {
            const [participants, workers, activeUsers, openIncidents] =
            await Promise.all([
                Participant.countDocuments({...companyFilter, status: "active" }),
                WorkerProfile.countDocuments(companyFilter),
                User.countDocuments({...companyFilter, status: "active" }),
                Incident.countDocuments({
                    ...companyFilter,
                    status: { $in: ["open", "in_review"] },
                }),
            ]);

            return {
                summary: [
                    { label: "Active participants", value: participants },
                    { label: "Active workers", value: workers },
                    { label: "Active users", value: activeUsers },
                    { label: "Open incidents", value: openIncidents },
                ],
                companies: [],
            };
        },
    };

    const resolver = roleMatchers[currentUser.role] || roleMatchers.default;
    return resolver();
}