import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { defaultDocumentReviews } from "../src/constants/supportWorkerDocumentSlots.js";

const rolesCollection = "roles";
const companiesCollection = "companies";
const usersCollection = "users";
const workerProfilesCollection = "workerprofiles";
const participantsCollection = "participants";

const roleDefinitions = [{
        name: "super_admin",
        description: "Syntrix platform owner and manager",
        permissions: ["platform:*"],
    },
    {
        name: "company_admin",
        description: "Company operations and workforce administration",
        permissions: [
            "user:manage",
            "participant:manage",
            "worker:manage",
            "report:view",
        ],
    },
    {
        name: "state_manager",
        description: "State-level operations oversight",
        permissions: ["participant:manage", "worker:manage", "shift:manage"],
    },
    {
        name: "care_manager",
        description: "Participant and plan management",
        permissions: [
            "participant:manage",
            "shift:view",
            "shift:manage",
            "budget:view",
            "incident:create",
        ],
    },
    {
        name: "support_worker",
        description: "Frontline support worker",
        permissions: ["shift:view", "shift-note:submit", "incident:create"],
    },
];

const demoUsers = [{
        firstName: "Syntrix",
        lastName: "Admin",
        email: "superadmin@syntrix.com",
        roleName: "super_admin",
        state: "NSW",
        phone: "0410000001",
    },
    {
        firstName: "Horizon",
        lastName: "Manager",
        email: "companyadmin@horizoncare.com",
        roleName: "company_admin",
        state: "NSW",
        phone: "0410000002",
    },
    {
        firstName: "State",
        lastName: "Lead",
        email: "statemanager@horizoncare.com",
        roleName: "state_manager",
        state: "VIC",
        phone: "0410000003",
    },
    {
        firstName: "Care",
        lastName: "Manager",
        email: "caremanager@horizoncare.com",
        roleName: "care_manager",
        state: "NSW",
        phone: "0410000004",
    },
    {
        firstName: "Jordan",
        lastName: "Taylor",
        email: "worker@horizoncare.com",
        roleName: "support_worker",
        state: "NSW",
        phone: "0410000005",
        address: "123 Demo St, Parramatta NSW 2150",
    },
];

const demoParticipants = [{
        firstName: "Olivia",
        lastName: "Brown",
        ndisNumber: "43000111",
        state: "NSW",
        phone: "0400000001",
    },
    {
        firstName: "Noah",
        lastName: "Wilson",
        ndisNumber: "43000112",
        state: "VIC",
        phone: "0400000002",
    },
    {
        firstName: "Ava",
        lastName: "Johnson",
        ndisNumber: "43000113",
        state: "QLD",
        phone: "0400000003",
    },
];

async function run() {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGO_DB_NAME || "syntrixDB";

    if (!mongoUri) {
        throw new Error("MONGODB_URI is required");
    }

    await mongoose.connect(mongoUri, { dbName });
    const db = mongoose.connection.db;
    const now = new Date();

    const passwordHash = await bcrypt.hash("Password123!", 12);

    for (const role of roleDefinitions) {
        await db.collection(rolesCollection).updateOne({ name: role.name }, {
            $set: {
                description: role.description,
                permissions: role.permissions,
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
        }, { upsert: true }, );
    }

    const roles = await db.collection(rolesCollection).find({}).toArray();
    const roleMap = Object.fromEntries(roles.map((role) => [role.name, role]));

    const legacyCoordinatorRole = await db
        .collection(rolesCollection)
        .findOne({ name: "support_coordinator" });
    const careManagerRole = roleMap.care_manager;
    if (legacyCoordinatorRole && careManagerRole) {
        await db.collection(usersCollection).updateMany(
            { roleId: legacyCoordinatorRole._id },
            { $set: { roleId: careManagerRole._id, updatedAt: now } },
        );
        await db.collection(rolesCollection).deleteOne({ _id: legacyCoordinatorRole._id });
    }

    for (const collName of ["assignments", "shifts", "participantplans"]) {
        try {
            await db.collection(collName).updateMany(
                { coordinatorUserId: { $exists: true } },
                { $rename: { coordinatorUserId: "careManagerUserId" } },
            );
        } catch {
            // Rename may fail if already migrated or both fields exist
        }
    }

    await db.collection(companiesCollection).updateOne({ abn: "51824753556" }, {
        $set: {
            name: "Horizon Care Group",
            email: "admin@horizoncare.com",
            phone: "0290001234",
            address: "Level 3, 120 George St, Sydney NSW",
            state: "NSW",
            status: "active",
            updatedAt: now,
        },
        $setOnInsert: {
            createdAt: now,
        },
    }, { upsert: true }, );

    const company = await db
        .collection(companiesCollection)
        .findOne({ abn: "51824753556" });

    if (!company) {
        throw new Error("Failed to create or load demo company");
    }

    for (const user of demoUsers) {
        const role = roleMap[user.roleName];
        const isSuperAdmin = user.roleName === "super_admin";

        await db.collection(usersCollection).updateOne({ email: user.email.toLowerCase() }, {
            $set: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email.toLowerCase(),
                roleId: role._id,
                companyId: isSuperAdmin ? null : company._id,
                phone: user.phone,
                ...(user.address ? { address: user.address } : {}),
                state: user.state,
                status: "active",
                passwordHash,
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
        }, { upsert: true }, );
    }

    const workerUser = await db
        .collection(usersCollection)
        .findOne({ email: "worker@horizoncare.com" });

    if (workerUser) {
        await db.collection(workerProfilesCollection).updateOne({ userId: workerUser._id }, {
            $set: {
                companyId: company._id,
                employeeCode: "HCG-W-1001",
                employmentType: "part_time",
                jobTitle: "Disability Support Worker",
                availabilityStatus: "available",
                residentialStatus: "australian_citizen",
                hoursRestriction: "fortnightly_48",
                documentReviews: defaultDocumentReviews(),
                joinedAt: now,
                updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
        }, { upsert: true }, );
    }

    for (const participant of demoParticipants) {
        await db.collection(participantsCollection).updateOne({ companyId: company._id, ndisNumber: participant.ndisNumber }, {
            $set: {
                firstName: participant.firstName,
                lastName: participant.lastName,
                dob: new Date("1992-03-01"),
                gender: "prefer_not_to_say",
                phone: participant.phone,
                address: "Sydney, Australia",
                emergencyContact: {
                    name: "Primary Contact",
                    phone: "0400111222",
                    relationship: "Family",
                },
                state: participant.state,
                status: "active",
                updatedAt: now,
            },
            $setOnInsert: {
                companyId: company._id,
                ndisNumber: participant.ndisNumber,
                createdAt: now,
            },
        }, { upsert: true }, );
    }

    await db.collection(usersCollection).deleteOne({ email: "coordinator@horizoncare.com" });

    console.log("Seed complete.");
    console.log("Login: superadmin@syntrix.com");
    console.log("Password: Password123!");

    await mongoose.disconnect();
}

run().catch(async(error) => {
    console.error("Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
});