# Syntrix , Requirements Specification

This document describes what the **Syntrix** system is for and what it must support. It matches the current product direction: a **multi-tenant NDIS operations** web application for Australian NDIS providers.

---

## 1. Purpose

**Syntrix** helps NDIS provider organisations manage their day-to-day operations in one place: staff, participants, scheduling, budgets, incidents, compliance-related workflows, and reporting, while keeping each **company’s data separate** from others.

---

## 2. Who Uses the System

| Role                              | What they need to do                                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sytntrix Platform super admin** | Manage the whole platform; work across companies when required.                                                                                      |
| **Company admin**                 | Manage their organisation's workers, participants, rostering, reports, budgets, audit visibility.                                                    |
| **Company State manager**         | Oversee operations in their assigned state: participants, Support workers, care managers, shifts; view reports, compliance Documents.                |
| **Company Care manager**          | Focus on participants and plans: manage participants, view/manage shifts, view budgets, create incidents.                                            |
| **Company Support worker**        | See their schedule, submit shift notes, set availability, use clock in/out features, create incidents, submit expenses; Submit compliance documents. |

The system must **show only the screens and actions** each role is allowed to use (role-based navigation and API protection).

---

## 3. Core Requirements

### 3.1 Access and security

- Users **sign in** with email and password.
- Sessions are **secure** (e.g. HTTP-only cookie with JWT); users can **sign out**.
- **Routes and APIs** must be protected: unauthenticated users go to login; users cannot access another company’s data.

### 3.2 Multi-tenancy (companies)

- The system supports **many provider companies** on one platform.
- Company-owned records are tied to a **company identifier**; users only see **their company’s** data.
- **Company onboarding** (and related welcome communication) by the super Admin.

### 3.3 Organisations and people

- **Companies** can be created and managed (within the rules of each role).
- **Users** can be created and listed; each user has a **role** and belongs to a company (except platform-level users as designed).
- **Support workers** have **profiles** (skills, documents, availability, etc. as implemented).
- **Participants** (NDIS participants served by the provider) can be **created and managed**, including **plan / budget** fields that the product uses (`totalBudget`, `allocatedBudget`, `availableBudget`, etc.).

### 3.4 Scheduling and work

- **Assignments / roster / shifts** can be created and viewed according to role.
- **Support workers** can see their shifts, **submit shift notes**, expenses and manage **availability**.
- **Clock In/Out** (time logging) is available for the workforce flows defined in the product.

### 3.5 Rules that protect participants and workers

These business rules must be enforced in logic (not only in the UI):

- **At most one active state manager per Australian state** within a company.
- A participant may have **at most three support workers within any rolling 24-hour window.**
- A support worker may work **at most eight hours within any rolling 24-hour window.**
- **Support worker hourly rate** is **view-only** for support workers; admins manage rates where permitted.
- Participants are billed according to an **hourly rate** set by the company admin; each assignment uses this admin-set rate for billing purposes.

### 3.6 Incidents and compliance

- **Incidents** can be **created** by roles that are allowed to (e.g. care manager, support worker).
- **Compliance** and **documents** areas exist in the app. Uploaded compliance documents are accessible for checking and viewing by State managers and Care managers.

### 3.7 Insights and reporting

- The system provides **company**, **state manager**, **care manager**, **participant**, and **support worker** insights (dashboards or summaries as implemented).
- **Reports** are viewable by roles that have **report** permission.

### 3.8 Audit and accountability

- Important actions (writes, auth events, etc.) are recorded in an **audit log** with a **log type** so administrators can filter and review what happened.

### 3.9 Email

- The system can **send transactional emails** (e.g. welcome, notifications) using configured SMTP;

---

## 4. Non-Functional Requirements (Simple List)

- **Usability:** Web UI with clear navigation; light/dark theme.
- **Reliability:** Data is stored in **MongoDB**
- **Validation:** User and API inputs are **validated** with Zod before persistence.

---

## 5. Out of Scope / Future (Clarify per Release)

- Maintenance, mobile application development.
- Marketing of the Syntrix Platform.
- Anything not listed above is **not guaranteed** unless added to this document or to a formal release plan.

---

## 6. Success Criteria (How We Know It Works)

- A user can **log in**, see a **role-appropriate** dashboard, and perform allowed tasks **only for their company**.
- **Participants**, **workers**, and **assignments** can be managed.
- **Audit logs** of actions and can be **filtered** by type.
- Each company has its own dashboard. Data and dashboards are isolated so that users only see information for their assigned company.

---
