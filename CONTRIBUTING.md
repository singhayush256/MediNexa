# Contributing to MediNexa

Thank you for your interest in contributing to **MediNexa**, the open-source, enterprise-grade Hospital Management System designed for Indian tertiary healthcare.

We welcome contributions from clinicians, frontend engineers, backend developers, healthcare informatics specialists, security researchers, and DevOps practitioners.

---

## Code of Conduct

MediNexa is dedicated to providing a harassment-free and inclusive experience for everyone. We pledge to act in ways that contribute to an open, welcoming, diverse, and healthy community.

- Use welcoming and inclusive language.
- Be respectful of differing viewpoints and clinical operational paradigms.
- Gracefully accept constructive criticism.
- Focus on what is best for patient data security and healthcare reliability.

---

## Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/singhayush256/MediNexa.git
cd MediNexa
```

### 2. Branching Convention
Create a branch named according to the following conventions:
- `feature/description`: New clinical, operational, or UI feature
- `fix/description`: Bug fix or error resolution
- `docs/description`: Documentation updates
- `perf/description`: Performance optimization or database query indexing
- `refactor/description`: Code refactoring with no behavior change

```bash
git checkout -b feature/patient-vitals-charting
```

### 3. Commit Convention (Conventional Commits)
MediNexa follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for users or clinicians
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of code (white-space, formatting)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

**Example:**
```bash
git commit -m "feat(pharmacy): add FEFO expiry batch priority tracking"
```

---

## Coding Standards

### TypeScript & Strict Mode
- All packages use TypeScript in `strict` mode.
- Avoid the `any` type whenever possible. Define shared interfaces in `packages/types`.
- Use explicit return types on NestJS service methods and Next.js utility functions.

### Backend (NestJS 10)
- **DTOs & Validation:** Every incoming API request payload must be validated with class-validator decorators (`@IsString()`, `@IsNumber()`, `@IsOptional()`, `@IsEnum()`).
- **Prisma Transactions:** Wrap multi-step mutations (e.g. appointment booking, inventory decrement, billing invoice creation) in `this.prisma.$transaction(...)`.
- **RBAC Guards:** Protect endpoints using `@UseGuards(JwtAuthGuard, RolesGuard)` and specify allowed roles with `@Roles(RoleCode.DOCTOR, RoleCode.HOSPITAL_ADMIN)`.
- **Audit Events:** All PHI mutations must trigger an audit entry via `AuditService.record(...)`.

### Frontend (Next.js 14 App Router)
- Use functional React components with React Hooks.
- Ensure all Client Components declare `'use client';` at the very top.
- Heavy client-side libraries (like `jsPDF`) must be dynamically imported with `typeof window !== 'undefined'` guards to prevent SSR hydration mismatches.
- Style components using **Tailwind CSS** utility classes following the MediNexa design tokens.

---

## Running Tests & Verifications

Before submitting a Pull Request, ensure that all automated test suites pass and that the production build compiles cleanly:

```bash
# 1. Typecheck the entire monorepo
npm run typecheck

# 2. Run automated hospital journey tests
node scratch/test_hospital_journey_e2e.js

# 3. Verify production Next.js build
npm run build --workspace=@medinexa/web
```

---

## Pull Request Submission Checklist

When opening a Pull Request, verify:
- [ ] Title follows Conventional Commits format (`feat(module): description`).
- [ ] Added or updated unit/integration tests covering new functionality.
- [ ] Verified zero TypeScript compiler errors (`npm run typecheck`).
- [ ] Next.js web build passes with exit code 0 (`npm run build --workspace=@medinexa/web`).
- [ ] No hardcoded passwords, private API keys, or personal health identifiers (PHI) are committed.
- [ ] Updated `README.md` or related documentation if user-facing behavior has changed.

---

## Reporting Security Vulnerabilities

Please **do not** open public GitHub issues for security vulnerabilities. Instead, report security advisories directly to the security team at **`security@medinexa.in`**. We acknowledge receipt within 24 hours and provide remediation updates until resolved.
