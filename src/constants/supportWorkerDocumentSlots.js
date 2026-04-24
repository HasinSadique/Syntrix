/** Slot ids stored on WorkerProfile.documentReviews and used in the support worker profile UI. */

export const RESIDENTIAL_STATUS = {
  AUSTRALIAN_CITIZEN: "australian_citizen",
  PERMANENT_RESIDENT: "permanent_resident",
  INTERNATIONAL: "international",
};

export const RESIDENTIAL_OPTIONS = [
  { value: RESIDENTIAL_STATUS.AUSTRALIAN_CITIZEN, label: "Australian citizen" },
  { value: RESIDENTIAL_STATUS.PERMANENT_RESIDENT, label: "Permanent resident" },
  { value: RESIDENTIAL_STATUS.INTERNATIONAL, label: "International / temporary visa" },
];

export const HOURS_RESTRICTION = {
  FORTNIGHTLY_48: "fortnightly_48",
  UNLIMITED: "unlimited",
};

export const HOURS_RESTRICTION_OPTIONS = [
  { value: HOURS_RESTRICTION.FORTNIGHTLY_48, label: "48 hours per fortnight" },
  { value: HOURS_RESTRICTION.UNLIMITED, label: "Unlimited hours" },
];

export const DOC_REVIEW_STATUS = {
  INCOMPLETE: "incomplete",
  SUBMITTED: "submitted",
  COMPLETE: "complete",
};

export const SUPPORT_WORKER_DOCUMENT_SLOTS = [
  {
    id: "first_aid",
    label: "Valid First Aid",
    detail: "Current certificate",
  },
  {
    id: "cpr",
    label: "Valid CPR",
    detail: "Current CPR qualification",
  },
  {
    id: "manual_handling",
    label: "Manual handling (health care worker)",
    detail: "Within the last 12 months · optional",
    optional: true,
  },
  {
    id: "national_police_check",
    label: "National Police Check",
    detail: "Current police check",
  },
  {
    id: "wwcc",
    label: "Working with Children Check (WWCC)",
    detail: "As applicable in your state",
  },
  {
    id: "ndis_worker_check",
    label: "NDIS Worker Check",
    detail: "Upload clearance or application receipt if applicable",
  },
  {
    id: "cert_iii_iv",
    label: "Certificate III / IV (age, disability, individual care or related)",
    detail: "Or other health-related certificate",
  },
  {
    id: "passport_photo",
    label: "Passport-size photo (ID)",
    detail: "Recent photo for identification",
  },
  {
    id: "id_document_1",
    label: "ID document 1",
    detail: "Towards 100 points of ID (e.g. Australian driver licence)",
  },
  {
    id: "id_document_2",
    label: "ID document 2",
    detail: "Second ID towards 100 points (e.g. passport)",
  },
  {
    id: "cv",
    label: "Updated CV",
    detail: "Most recent résumé",
  },
  {
    id: "visa_copy",
    label: "Copy of visa",
    detail: "If you are not an Australian resident or citizen",
    visaOnly: true,
  },
  {
    id: "vaccinations",
    label: "COVID & influenza vaccination",
    detail: "Certificate or confirmation",
  },
];

export function defaultDocumentReviews() {
  return Object.fromEntries(
    SUPPORT_WORKER_DOCUMENT_SLOTS.map(({ id }) => [
      id,
      { reviewStatus: DOC_REVIEW_STATUS.INCOMPLETE },
    ]),
  );
}

export function mergeDocumentReviews(stored) {
  const base = defaultDocumentReviews();
  if (!stored || typeof stored !== "object") {
    return base;
  }
  for (const id of Object.keys(base)) {
    const rs = stored[id]?.reviewStatus;
    if (rs === DOC_REVIEW_STATUS.SUBMITTED || rs === DOC_REVIEW_STATUS.COMPLETE) {
      base[id] = { reviewStatus: rs };
    }
  }
  return base;
}

export function isVisaSlotWaived(residentialStatus) {
  return residentialStatus !== RESIDENTIAL_STATUS.INTERNATIONAL;
}

export function eligibleDocumentSlots(residentialStatus) {
  return SUPPORT_WORKER_DOCUMENT_SLOTS.filter(
    (s) => !(s.visaOnly && isVisaSlotWaived(residentialStatus)),
  );
}
