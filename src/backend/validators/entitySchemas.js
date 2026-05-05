import { z } from "zod";

export const objectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid ObjectId");

const requiredText = (label) =>
    z.string().trim().min(1, `${label} is required`);
const optionalTextArray = z.array(z.string().trim().min(1)).default([]);
const dateField = (label) => z.coerce.date({ message: `${label} is required` });

export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    companyId: objectIdSchema.optional(),
});

export const participantPlanCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    participantId: objectIdSchema,
    careManagerUserId: objectIdSchema,
    planStart: dateField("planStart"),
    planEnd: dateField("planEnd"),
    goals: optionalTextArray,
    supportNeeds: optionalTextArray,
    risks: optionalTextArray,
    preferences: optionalTextArray,
    serviceAgreementStatus: z
        .enum(["draft", "pending", "signed", "expired"])
        .default("draft"),
});

export const participantPlanListQuerySchema = paginationQuerySchema.extend({
    participantId: objectIdSchema.optional(),
    careManagerUserId: objectIdSchema.optional(),
    serviceAgreementStatus: z
        .enum(["draft", "pending", "signed", "expired"])
        .optional(),
});

export const participantBudgetCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    participantId: objectIdSchema,
    categoryName: requiredText("categoryName"),
    allocatedAmount: z.coerce.number().min(0),
    usedAmount: z.coerce.number().min(0).default(0),
    startDate: dateField("startDate"),
    endDate: dateField("endDate"),
});

export const participantBudgetListQuerySchema = paginationQuerySchema.extend({
    participantId: objectIdSchema.optional(),
    categoryName: z.string().trim().optional(),
});

const routineDayKeySchema = z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
]);

export const assignmentCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    participantId: objectIdSchema,
    workerUserId: objectIdSchema,
    careManagerUserId: objectIdSchema,
    startDate: dateField("startDate"),
    endDate: dateField("endDate"),
    status: z
        .enum(["active", "paused", "completed", "cancelled"])
        .default("active"),
    supportTitle: z.string().trim().optional(),
    supportDescription: z.string().trim().optional(),
    routineDayKeys: z.array(routineDayKeySchema).optional(),
    routineStartTime: z
        .string()
        .trim()
        .regex(/^\d{2}:\d{2}$/, "routineStartTime must be HH:mm")
        .optional(),
    routineEndTime: z
        .string()
        .trim()
        .regex(/^\d{2}:\d{2}$/, "routineEndTime must be HH:mm")
        .optional(),
});

export const assignmentListQuerySchema = paginationQuerySchema.extend({
    participantId: objectIdSchema.optional(),
    workerUserId: objectIdSchema.optional(),
    status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
});

export const shiftCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    participantId: objectIdSchema,
    workerUserId: objectIdSchema,
    careManagerUserId: objectIdSchema,
    shiftDate: dateField("shiftDate"),
    startTime: z
        .string()
        .trim()
        .regex(/^\d{2}:\d{2}$/, "startTime must be HH:mm"),
    endTime: z
        .string()
        .trim()
        .regex(/^\d{2}:\d{2}$/, "endTime must be HH:mm"),
    serviceType: requiredText("serviceType"),
    location: z.string().trim().optional(),
    status: z
        .enum(["scheduled", "in_progress", "completed", "cancelled"])
        .default("scheduled"),
    approvalStatus: z
        .enum(["pending", "approved", "rejected"])
        .default("pending"),
});

export const shiftListQuerySchema = paginationQuerySchema.extend({
    workerUserId: objectIdSchema.optional(),
    participantId: objectIdSchema.optional(),
    status: z
        .enum(["scheduled", "in_progress", "completed", "cancelled"])
        .optional(),
    approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    shiftDateFrom: z.coerce.date().optional(),
    shiftDateTo: z.coerce.date().optional(),
});

export const shiftNoteCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    shiftId: objectIdSchema,
    noteText: requiredText("noteText"),
    participantUpdate: z.string().trim().optional(),
    mileageKm: z.coerce.number().min(0).default(0),
    expenseAmount: z.coerce.number().min(0).default(0),
    reviewStatus: z
        .enum(["pending", "reviewed", "needs_changes"])
        .default("pending"),
});

export const shiftNoteListQuerySchema = paginationQuerySchema.extend({
    shiftId: objectIdSchema.optional(),
    reviewStatus: z.enum(["pending", "reviewed", "needs_changes"]).optional(),
});

export const incidentCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    shiftId: objectIdSchema.optional(),
    participantId: objectIdSchema,
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    category: requiredText("category"),
    description: requiredText("description"),
    actionTaken: z.string().trim().optional(),
    status: z.enum(["open", "in_review", "resolved", "closed"]).default("open"),
    reportedAt: z.coerce.date().optional(),
});

export const incidentListQuerySchema = paginationQuerySchema.extend({
    participantId: objectIdSchema.optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z.enum(["open", "in_review", "resolved", "closed"]).optional(),
});

export const documentCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    entityType: z.enum([
        "company",
        "participant",
        "user",
        "worker_profile",
        "shift",
        "incident",
        "compliance_record",
        "other",
    ]),
    entityId: objectIdSchema,
    documentType: requiredText("documentType"),
    fileUrl: z.string().trim().default(""),
    issueDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
    verificationStatus: z
        .enum(["pending", "verified", "rejected", "expired"])
        .default("pending"),
});

export const documentListQuerySchema = paginationQuerySchema.extend({
    entityType: z
        .enum([
            "company",
            "participant",
            "user",
            "worker_profile",
            "shift",
            "incident",
            "compliance_record",
            "other",
        ])
        .optional(),
    entityId: objectIdSchema.optional(),
    verificationStatus: z
        .enum(["pending", "verified", "rejected", "expired"])
        .optional(),
});

export const complianceRecordCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    userId: objectIdSchema,
    requirementName: requiredText("requirementName"),
    status: z
        .enum(["compliant", "expiring", "expired", "missing"])
        .default("missing"),
    expiryDate: z.coerce.date().optional(),
    documentId: objectIdSchema.optional(),
    checkedAt: z.coerce.date().optional(),
});

export const complianceRecordListQuerySchema = paginationQuerySchema.extend({
    userId: objectIdSchema.optional(),
    status: z.enum(["compliant", "expiring", "expired", "missing"]).optional(),
});

export const notificationCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    userId: objectIdSchema,
    type: requiredText("type"),
    title: requiredText("title"),
    message: requiredText("message"),
});

export const notificationListQuerySchema = paginationQuerySchema.extend({
    userId: objectIdSchema.optional(),
    isRead: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => {
            if (value === undefined) {
                return undefined;
            }
            return value === "true";
        }),
});

export const notificationMarkReadSchema = z.object({
    notificationId: objectIdSchema,
});

export const auditLogCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    action: requiredText("action"),
    entityType: requiredText("entityType"),
    entityId: z.string().trim().min(1),
    oldValue: z.any().optional(),
    newValue: z.any().optional(),
    metadata: z.any().optional(),
});

export const auditLogListQuerySchema = paginationQuerySchema.extend({
    userId: objectIdSchema.optional(),
    action: z.string().trim().optional(),
    entityType: z.string().trim().optional(),
});

const stateEnum = z.enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);

export const companyListQuerySchema = paginationQuerySchema.extend({
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    search: z.string().trim().optional(),
});

export const companyCreateSchema = z.object({
    name: requiredText("name"),
    abn: requiredText("abn"),
    email: z.string().trim().email("Invalid company email"),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    state: stateEnum,
    status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export const companyStatusUpdateSchema = z.object({
    status: z.enum(["active", "inactive"]),
});

export const participantCreateSchema = z.object({
    companyId: objectIdSchema.optional(),
    firstName: requiredText("firstName"),
    lastName: requiredText("lastName"),
    preferredName: z.string().trim().optional(),
    dob: dateField("dob"),
    gender: z
        .enum(["female", "male", "non_binary", "other", "prefer_not_to_say"])
        .default("prefer_not_to_say"),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    primaryDisability: z.string().trim().optional(),
    secondaryDisability: z.string().trim().optional(),
    medicalAlerts: optionalTextArray,
    highRiskFlags: optionalTextArray,
    epilepsyProtocol: z.string().trim().optional(),
    emergencyContact: z
        .object({
            name: z.string().trim().optional(),
            phone: z.string().trim().optional(),
            relationship: z.string().trim().optional(),
        })
        .optional(),
    ndisNumber: requiredText("ndisNumber"),
    state: stateEnum,
    managementType: z
        .enum(["agency_managed", "plan_managed", "self_managed"])
        .optional(),
    staffRatio: z.string().trim().optional(),
    status: z
        .enum(["active", "inactive", "on_hold", "discharged"])
        .default("active"),
});

export const participantListQuerySchema = paginationQuerySchema.extend({
    status: z.enum(["active", "inactive", "on_hold", "discharged"]).optional(),
    state: stateEnum.optional(),
    search: z.string().trim().optional(),
});

export const userListQuerySchema = paginationQuerySchema.extend({
    role: z
        .enum([
            "super_admin",
            "company_admin",
            "state_manager",
            "care_manager",
            "support_worker",
        ])
        .optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    search: z.string().trim().optional(),
});

const workerProfileBaseSchema = z.object({
    employmentType: z
        .enum(["full_time", "part_time", "casual", "contract"])
        .default("casual"),
    jobTitle: z.string().trim().optional(),
    availabilityStatus: z
        .enum(["available", "limited", "unavailable", "on_leave"])
        .default("available"),
    residentialStatus: z
        .enum(["australian_citizen", "permanent_resident", "international"])
        .optional(),
    hoursRestriction: z.enum(["fortnightly_48", "unlimited"]).optional(),
    visaType: z.string().trim().max(200).optional(),
});

export const userCreateSchema = z
    .object({
        companyId: objectIdSchema.optional(),
        role: z.enum([
            "super_admin",
            "company_admin",
            "state_manager",
            "care_manager",
            "support_worker",
        ]),
        firstName: requiredText("firstName"),
        lastName: requiredText("lastName"),
        email: z.string().trim().email("Invalid user email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        phone: z.string().trim().optional(),
        state: stateEnum.optional(),
        status: z.enum(["active", "inactive", "suspended"]).default("active"),
        workerProfile: workerProfileBaseSchema.optional(),
    })
    .superRefine((data, ctx) => {
        if (data.role !== "support_worker") {
            return;
        }
        const wp = data.workerProfile;
        if (!wp) {
            ctx.addIssue({
                code: z.ZodIssue.custom,
                message: "workerProfile is required when creating a Support Worker",
                path: ["workerProfile"],
            });
            return;
        }
        if (!wp.residentialStatus) {
            ctx.addIssue({
                code: z.ZodIssue.custom,
                message: "Residential status is required",
                path: ["workerProfile", "residentialStatus"],
            });
        }
        if (!wp.hoursRestriction) {
            ctx.addIssue({
                code: z.ZodIssue.custom,
                message: "Working hours restriction is required",
                path: ["workerProfile", "hoursRestriction"],
            });
        }
        if (wp.residentialStatus === "international" && !wp.visaType?.trim()) {
            ctx.addIssue({
                code: z.ZodIssue.custom,
                message: "Visa type is required for international workers",
                path: ["workerProfile", "visaType"],
            });
        }
    });

export const supportWorkerContactUpdateSchema = z.object({
    phone: z.string().trim().max(40).optional(),
    address: z.string().trim().max(500).optional(),
});

const availabilityDaySchema = z.object({
    enabled: z.boolean(),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
});

export const supportWorkerAvailabilityUpdateSchema = z.object({
    repeatMode: z.enum(["weekly", "date-range"]),
    rangeStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    rangeEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    savedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    days: z.object({
        monday: availabilityDaySchema,
        tuesday: availabilityDaySchema,
        wednesday: availabilityDaySchema,
        thursday: availabilityDaySchema,
        friday: availabilityDaySchema,
        saturday: availabilityDaySchema,
        sunday: availabilityDaySchema,
    }),
});