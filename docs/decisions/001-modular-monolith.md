# ADR 001: Adoption of Modular Monolith Architecture

* **Status**: Accepted
* **Deciders**: Lead Architect & Engineering Team
* **Date**: Day 1 Foundation

---

## Context & Problem Statement

MediNexa will eventually span complex healthcare domains including patient records, bed management, billing, lab pathology, pharmacy, emergency response, and multi-hospital referrals.

When building complex systems, teams often face the choice between starting with **Microservices** vs. a **Monolith**.

---

## Decision Drivers

1. **Development Speed & Agility**: Day 1 and early startup velocity requires minimal deployment overhead.
2. **Domain Boundary Discovery**: Healthcare domains evolve quickly; premature microservice boundaries lead to expensive cross-service refactoring.
3. **Data Integrity & Transactions**: Complex healthcare workflows require atomic ACID transactions across entities.
4. **Operational Simplicity**: Running dozens of microservices requires dedicated DevOps, service meshes, distributed tracing, and complex CI/CD.

---

## Decision Outcome

We decided to adopt a **Modular Monolith** architecture.

### Key Principles of MediNexa's Modular Monolith:
- **Strict Domain Boundaries**: Each domain module (e.g. `HealthModule`, `UserModule`, `OrgModule`) resides in its own isolated NestJS module directory.
- **Shared Code via Workspace Packages**: Shared DTOs and type definitions reside in `@medinexa/types` and `@medinexa/validation`.
- **Single Database Instance with Logical Schema Separation**: All initial tables exist inside PostgreSQL (`medinexa` DB) managed via Prisma.
- **Future-Proof Extraction Path**: Because module boundaries are strictly enforced inside NestJS, any module can be extracted into an independent microservice in the future if scale demands it.

---

## Consequences

### Positive:
- Fast setup, zero distributed system complexity on Day 1.
- Type safety across the entire application stack via monorepo TypeScript integration.
- Simple, reliable database migrations via Prisma.
- Instant local setup for developers (`npm run dev`).

### Negative / Mitigation:
- Developers must maintain discipline not to leak logic across module boundaries.
- *Mitigation*: Code reviews, linting rules, and explicit TypeScript exports.
