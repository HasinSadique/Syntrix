"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Pencil, UserRound, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DOC_REVIEW_STATUS,
  HOURS_RESTRICTION_OPTIONS,
  RESIDENTIAL_OPTIONS,
  SUPPORT_WORKER_DOCUMENT_SLOTS,
  eligibleDocumentSlots,
  isVisaSlotWaived,
} from "@/constants/supportWorkerDocumentSlots";

function residentialLabel(value) {
  return RESIDENTIAL_OPTIONS.find((o) => o.value === value)?.label || value;
}

function hoursLabel(value) {
  return (
    HOURS_RESTRICTION_OPTIONS.find((o) => o.value === value)?.label || value
  );
}

function reviewBadgeVariant(status) {
  if (status === DOC_REVIEW_STATUS.COMPLETE) return "success";
  if (status === DOC_REVIEW_STATUS.SUBMITTED) return "default";
  return "warning";
}

function reviewLabel(status) {
  if (status === DOC_REVIEW_STATUS.COMPLETE) return "Complete";
  if (status === DOC_REVIEW_STATUS.SUBMITTED) return "Submitted";
  return "Incomplete";
}

function computeDocumentProgress(
  residentialStatus,
  documentReviews,
  localFiles,
) {
  const slots = eligibleDocumentSlots(residentialStatus);
  const n = slots.length;
  if (n === 0) return 100;
  let uploaded = 0;
  let complete = 0;
  for (const s of slots) {
    if (localFiles[s.id]) uploaded += 1;
    if (documentReviews[s.id]?.reviewStatus === DOC_REVIEW_STATUS.COMPLETE) {
      complete += 1;
    }
  }
  return Math.round((50 * uploaded) / n + (50 * complete) / n);
}

const readOnlyBox =
  "rounded-xl border border-zinc-200/90 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200";

export function SupportWorkerProfile({ user }) {
  const router = useRouter();
  const wp = user.workerProfile || {};
  const residentialStatus = wp.residentialStatus || "australian_citizen";
  const hoursRestriction = wp.hoursRestriction || "fortnightly_48";
  const visaType = wp.visaType || "";
  const documentReviews = wp.documentReviews || {};

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Your profile";

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [localFiles, setLocalFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [submitHint, setSubmitHint] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => {
    if (editing) return;
    setPhone(user.phone || "");
    setAddress(user.address || "");
  }, [user.phone, user.address, editing]);

  const progress = useMemo(
    () =>
      computeDocumentProgress(residentialStatus, documentReviews, localFiles),
    [residentialStatus, documentReviews, localFiles],
  );

  const handleFile = useCallback((slotId, fileList) => {
    const file = fileList?.[0] || null;
    setLocalFiles((prev) => {
      const next = { ...prev };
      if (file) next[slotId] = file;
      else delete next[slotId];
      return next;
    });
  }, []);

  const handleSaveContact = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const response = await fetch("/api/users/me/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveError(data.error || "Could not save");
        return;
      }
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setEditing(false);
      router.refresh();
    } catch {
      setSaveError("Could not save right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setSaveError("");
    setEditing(false);
  };

  const handleDummySubmit = () => {
    setSubmitHint(
      "Submit is not wired up yet. Files you chose are only in this browser until storage and workflows are connected.",
    );
  };

  const handleProfilePhotoChange = (fileList) => {
    const file = fileList?.[0] || null;
    setProfilePhotoFile(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Update your profile details and upload your current documents.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveContact}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {saveError ? (
        <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>
      ) : null}

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <UserRound className="h-10 w-10 text-zinc-400" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-xl">{displayName}</CardTitle>
              {profilePhotoFile ? (
                <CardDescription className="mt-1">
                  Selected photo: {profilePhotoFile.name}
                </CardDescription>
              ) : (
                <CardDescription className="mt-1">
                  Choose and upload a photo file.
                </CardDescription>
              )}
            </div>
          </div>
          <input
            id="profile-photo-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              handleProfilePhotoChange(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-zinc-300 dark:border-zinc-600"
            title="Choose an image file."
            onClick={() =>
              document.getElementById("profile-photo-upload")?.click()
            }
          >
            <Camera className="mr-2 h-4 w-4" />
            Change photo
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <div className={readOnlyBox}>{user.firstName || "—"}</div>
          </Field>
          <Field label="Last name">
            <div className={readOnlyBox}>{user.lastName || "—"}</div>
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <div className={readOnlyBox}>{user.email || "—"}</div>
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              placeholder="Mobile or daytime number"
            />
          </Field>
          <Field label="Residential status">
            <div className={readOnlyBox}>
              {residentialLabel(residentialStatus)}
            </div>
          </Field>
          <Field label="Current address" className="sm:col-span-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!editing}
              placeholder="Street, suburb, state, postcode"
            />
          </Field>
          {residentialStatus === "international" ? (
            <Field label="Visa type" className="sm:col-span-2">
              <div className={readOnlyBox}>{visaType || "—"}</div>
            </Field>
          ) : null}
          <Field label="Working hours restriction" className="sm:col-span-2">
            <div className={readOnlyBox}>{hoursLabel(hoursRestriction)}</div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Licences & documents</CardTitle>
          <CardDescription>Upload your current documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Document progress
              </p>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {progress}%
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400"></p>
          </div>

          <ul className="space-y-3">
            {SUPPORT_WORKER_DOCUMENT_SLOTS.map((doc) => {
              const waived =
                doc.visaOnly && isVisaSlotWaived(residentialStatus);
              const reviewStatus = waived
                ? DOC_REVIEW_STATUS.COMPLETE
                : documentReviews[doc.id]?.reviewStatus ||
                  DOC_REVIEW_STATUS.INCOMPLETE;
              const file = localFiles[doc.id];

              return (
                <li
                  key={doc.id}
                  className={cn(
                    "rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800",
                    waived && "bg-zinc-50/50 dark:bg-zinc-900/30",
                  )}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {doc.label}
                        {doc.optional ? (
                          <span className="ml-2 text-xs font-normal text-zinc-500">
                            (optional)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {doc.detail}
                      </p>
                      {!waived && file ? (
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Selected: {file.name}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {waived ? (
                        <Badge variant="secondary">Not required</Badge>
                      ) : (
                        <>
                          <Badge variant={reviewBadgeVariant(reviewStatus)}>
                            {reviewLabel(reviewStatus)}
                          </Badge>
                          <>
                            <input
                              id={`doc-upload-${doc.id}`}
                              type="file"
                              className="sr-only"
                              onChange={(e) => {
                                handleFile(doc.id, e.target.files);
                                e.target.value = "";
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                document
                                  .getElementById(`doc-upload-${doc.id}`)
                                  ?.click()
                              }
                            >
                              <Upload className="mr-1.5 h-3.5 w-3.5" />
                              Upload
                            </Button>
                          </>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDummySubmit}
            >
              Submit documents
            </Button>
            {submitHint ? (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {submitHint}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <label className={cn("block space-y-1.5 text-sm", className)}>
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}
