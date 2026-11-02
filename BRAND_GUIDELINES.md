# MediNexa Healthcare Enterprise — Brand Guidelines & Design System

**Document Version:** `2.0.0-ENTERPRISE`  
**Effective Date:** September 2026  
**Audience:** Design Leads, Product Managers, Frontend Engineers, Marketing & Brand Strategy  
**Tone & Voice:** Professional • Healthcare Focused • Trustworthy • Modern • Enterprise  

---

## 1. Brand Identity & Mission

### 1.1 Brand Purpose
**MediNexa** is the digital nervous system for modern hospitals. We unify fragmented clinical workflows, diagnostic laboratories, inpatient wards, pharmacy formularies, and revenue cycles into an uninterrupted, high-integrity platform.

### 1.2 Brand Pillars
1. **Clinical Precision:** Every data point, vital sign, and lab reference interval must be accurate, legible, and actionable for healthcare practitioners.
2. **Patient Trust:** Patient data privacy (DISHA / HIPAA) is fundamental. Our design communicates safety, clarity, and human dignity.
3. **Enterprise Reliability:** 99.99% operational uptime. Zero visual jitter, predictable layout geometry, and instant feedback.
4. **Modern Empathy:** Clean, breathable interfaces designed to alleviate clinical cognitive overload during emergency and high-stress environments.

---

## 2. Logo System & Usage Rules

### 2.1 The Master Mark (Cross-Pulse Shield)
The MediNexa emblem integrates two fundamental symbols of healthcare:
- **The Classical Medical Cross:** Symbolizing care, clinical readiness, and statutory healthcare.
- **The Vital Rhythm (ECG Pulse Wave):** Symbolizing life, real-time telemetry, responsiveness, and technological innovation.

```
       ┌────────────────────────┐
       │   [+] Medical Cross    │
       │            +           │  ===>  [ MediNexa Monogram Shield ]
       │   /\_/\_ ECG Pulse     │
       └────────────────────────┘
```

### 2.2 Logo Component Implementation
Implemented as a responsive SVG component at [`apps/web/components/brand/MediNexaLogo.tsx`](apps/web/components/brand/MediNexaLogo.tsx).

| Variant | Recommended Usage | Sizing |
| :--- | :--- | :--- |
| **Full Wordmark (`full`)** | Navigation headers, login pages, documentation, official reports | `sm` (32px), `md` (36px), `lg` (44px) |
| **Monogram Icon (`icon-only`)** | Favicons, collapsed sidebars, mobile headers, browser tabs | `xs` (24px), `sm` (32px) |
| **Wordmark Only (`wordmark-only`)**| Dense data tables, footer legal credits | `sm` (14px), `md` (16px) |

### 2.3 Logo Usage Rules & Disallowed Practices
- **Clear Space:** Maintain a minimum clear space surrounding the logo equal to 50% of the emblem's height (`0.5H`).
- **Minimum Size:** Never render the full wordmark smaller than `120px × 32px` in digital interfaces or `25mm` in physical prints.
- **Background Contrast:** Ensure minimum 4.5:1 contrast against background colors. Use the `white` theme variant on dark backgrounds (`#020617` or `#0F172A`).
- **Forbidden Treatments:**
  - ❌ Do NOT stretch, skew, or distort the aspect ratio.
  - ❌ Do NOT alter the gradient colors or replace them with unapproved hues.
  - ❌ Do NOT place the colored logo on low-contrast patterned backgrounds.
  - ❌ Do NOT add heavy drop shadows or glow filters beyond the approved `shadow-blue-600/20`.

---

## 3. Color System (Semantic Tokens)

MediNexa utilizes a purposeful, clinical color palette designed for high contrast, low eye fatigue in 24/7 hospital shifts, and WCAG 2.1 AA/AAA accessibility compliance.

### 3.1 Primary & Brand Colors
| Token Name | Hex | RGB | Tailwind Class | Semantic Application |
| :--- | :--- | :--- | :--- | :--- |
| **Clinical Blue 600** | `#2563EB` | `37, 99, 235` | `bg-blue-600` | Primary buttons, active tabs, brand accents |
| **Clinical Blue 700** | `#1D4ED8` | `29, 78, 216` | `bg-blue-700` | Hover states, focused boundaries |
| **Deep Navy 900** | `#0F172A` | `15, 23, 42` | `bg-slate-900` | Top headers, executive command center bars |
| **Night Navy 950** | `#020617` | `2, 6, 23` | `bg-slate-950` | Dark mode primary canvas, deep contrast background |

### 3.2 Healthcare Domain Accents
| Domain / Signal | Token Name | Hex Code | Tailwind Token | Clinical Context |
| :--- | :--- | :--- | :--- | :--- |
| **Vital Cyan** | Healing Teal 600 | `#0D9488` | `text-teal-600` | Telemedicine, Patient Portal, Wellness |
| **Emergency / STAT** | Clinical Rose 600 | `#E11D48` | `text-rose-600` | Critical vitals, Trauma alerts, Overdue invoices |
| **Caution / Triage** | Amber Gold 500 | `#F59E0B` | `text-amber-500`| Pending lab verification, Near-expiry batches |
| **Verified / Normal**| Forest Emerald 600| `#059669` | `text-emerald-600`| Normal lab values, Discharged status, Paid bills |
| **Specialist Rx** | Violet Iris 600 | `#7C3AED` | `text-purple-600`| Pharmacy formularies, Specialist consultations |

### 3.3 Neutral Surface & Text Palette
- **Canvas Light:** `#F8FAFC` (`bg-slate-50`)
- **Card Surface Light:** `#FFFFFF` (`bg-white` with `border-slate-200`)
- **Card Surface Dark:** `#0F172A` (`bg-slate-900` with `border-slate-800`)
- **Text Primary (Light/Dark):** `#0F172A` (Light) / `#F8FAFC` (Dark)
- **Text Secondary (Light/Dark):** `#475569` (`text-slate-600`) / `#94A3B8` (`text-slate-400`)
- **Text Muted:** `#64748B` (`text-slate-500`)

---

## 4. Typography System

### 4.1 Typeface Family
- **Primary Typeface:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Monospace Typeface:** `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace` (used for UHIDs, MRNs, Batch Numbers, GSTIN, and Lab values).

### 4.2 Typographic Hierarchy
| Role | Size | Line Height | Weight | Letter Spacing | CSS Utility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | 36px - 48px | 1.15 | Black (900) | `-0.025em` | `text-4xl font-black tracking-tight` |
| **Heading 1** | 30px - 36px | 1.2 | Extrabold (800) | `-0.02em` | `text-3xl font-extrabold tracking-tight` |
| **Heading 2** | 24px - 28px | 1.25 | Extrabold (800) | `-0.015em` | `text-2xl font-extrabold tracking-tight` |
| **Heading 3** | 18px - 20px | 1.3 | Bold (700) | `-0.01em` | `text-lg font-bold tracking-tight` |
| **Body Large** | 15px - 16px | 1.5 | Medium (500) | Normal | `text-base font-medium` |
| **Body Regular**| 13px - 14px | 1.5 | Normal (400) | Normal | `text-sm font-normal` |
| **Body Small** | 11px - 12px | 1.4 | Medium (500) | Normal | `text-xs font-medium` |
| **Overline/Tag**| 9px - 10px | 1.0 | Black (900) | `+0.05em` | `text-[10px] font-black uppercase tracking-wider` |

---

## 5. Iconography System

### 5.1 Icon Library
MediNexa standardizes on **Lucide React** icons with uniform geometric characteristics:
- **Default Stroke Width:** `1.75px` to `2.0px` (ensures readability on high-DPI retina displays).
- **Standard Bounding Box:** `16px × 16px` (`w-4 h-4`) or `20px × 20px` (`w-5 h-5`).
- **Container Styling:** Icons are paired with rounded squircle containers (`rounded-xl` or `rounded-2xl`) using 10% opacity tints of the corresponding semantic color:
  ```tsx
  <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400">
    <Stethoscope className="w-5 h-5" />
  </div>
  ```

---

## 6. Voice & Tone Guidelines

| Dimension | Tone Target | Do | Don't |
| :--- | :--- | :--- | :--- |
| **Hospital Tone** | Authoritative & Empathetic | "Patient vital signs recorded and within physiological threshold." | "Vitals saved successfully! Woohoo!" |
| **Financial Tone** | Statutory & Unambiguous | "Statutory Tax Invoice #INV-1092 generated under SAC 999311." | "Here's your bill dude!" |
| **Error Messages** | Informative & Remedy-Oriented | "Appointment slot is reserved. Please select an alternate 30-min window." | "Crash! Bad Request Error 409." |
| **Clinical Alerts** | High-Clarity & Actionable | "CRITICAL: Potassium level 6.2 mEq/L exceeds threshold. Immediate cardiology review required." | "Danger! Bad lab result." |

---

*MediNexa Brand Guidelines • Certified for Enterprise Healthcare SaaS.*
