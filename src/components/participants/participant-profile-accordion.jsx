"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ParticipantProfileAccordionContext = createContext(null);

/** Maps hash fragments (including nested anchors) to the parent accordion section id. */
const HASH_TO_SECTION = {
  "personal-medical": "personal-medical",
  "emergency-contacts": "emergency-contacts",
  "funding-management": "funding-management",
  "care-documentation": "care-documentation",
  "shift-notes": "care-documentation",
  "incident-history": "care-documentation",
  "worker-assignment": "worker-assignment",
  "participant-logs": "participant-logs",
  expenses: "expenses",
};

export function ParticipantProfileAccordion({ children }) {
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    const validSections = new Set([
      "personal-medical",
      "emergency-contacts",
      "funding-management",
      "care-documentation",
      "worker-assignment",
      "participant-logs",
      "expenses",
    ]);

    const applyHash = () => {
      const raw = window.location.hash.slice(1);
      if (!raw) return;
      const sectionId = HASH_TO_SECTION[raw] ?? raw;
      if (validSections.has(sectionId)) {
        setOpenSection(sectionId);
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const toggle = useCallback((sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  const expandSection = useCallback((sectionId, options) => {
    const scrollToId = options?.scrollToId ?? sectionId;
    setOpenSection(sectionId);
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(scrollToId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        const { pathname, search } = window.location;
        window.history.replaceState(
          null,
          "",
          `${pathname}${search}#${scrollToId}`,
        );
      });
    });
  }, []);

  const value = useMemo(
    () => ({ openSection, toggle, expandSection }),
    [openSection, toggle, expandSection],
  );

  return (
    <ParticipantProfileAccordionContext.Provider value={value}>
      <div className="space-y-4">{children}</div>
    </ParticipantProfileAccordionContext.Provider>
  );
}

export function useParticipantProfileAccordion() {
  const ctx = useContext(ParticipantProfileAccordionContext);
  if (!ctx) {
    throw new Error(
      "Participant profile accordion components must be used within ParticipantProfileAccordion",
    );
  }
  return ctx;
}

export function ParticipantProfileAccordionSection({
  sectionId,
  title,
  children,
  className,
  contentClassName,
}) {
  const { openSection, toggle } = useParticipantProfileAccordion();
  const isOpen = openSection === sectionId;

  return (
    <Card id={sectionId} className={className}>
      <CardHeader className="p-0">
        <button
          type="button"
          onClick={() => toggle(sectionId)}
          className="flex w-full items-center justify-between gap-3 rounded-t-2xl p-5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
          aria-expanded={isOpen}
        >
          <span className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
            {title}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-zinc-500 transition-transform dark:text-zinc-400",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </CardHeader>
      {isOpen ? (
        <CardContent className={cn("pt-0", contentClassName)}>
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}
