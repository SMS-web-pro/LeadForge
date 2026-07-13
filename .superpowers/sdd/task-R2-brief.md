# R2 — UltimateContent fields + ui.ts GDPR/footer labels

**Context:** Re-applying the reverted "Rapport de corrections" content fixes. This task adds the data fields the generator will carry (footerDesc + real-data flags) and the UI strings needed for the GDPR consent checkbox and the "no reviews yet" placeholder. (Eyebrow labels are added later in Task 6 — do NOT add those here.)

**Files**
- Modify: `src/lib/ultimateTemplate.ts` — add 3 optional fields to the `UltimateContent` interface (around line 180, after `establishedYear?: number;`).
- Modify: `src/lib/template/ui.ts` — add 3 FR and 3 EN label fields to the `UI` object (inside each locale block, right before its closing `},`).

## Steps

### Step1: UltimateContent interface
Find:
```ts
  accentOnDark?: string;
  hours?: string;
  establishedYear?: number;
}
```
Replace the closing with (add the three fields before `}`):
```ts
  accentOnDark?: string;
  hours?: string;
  establishedYear?: number;
  footerDesc?: string;
  hasRealRating?: boolean;
  hasRealReviews?: boolean;
}
```

### Step2: ui.ts — FR block
In the `fr: { ... }` block, find the last field:
```ts
    whatsapp: 'WhatsApp',
  },
```
Replace with:
```ts
    whatsapp: 'WhatsApp',
    formConsent: 'J\'accepte que mes coordonnées soient utilisées pour être recontacté(e) au sujet de ma demande. Voir notre ',
    privacyLink: 'politique de confidentialité',
    testEmpty: 'Avis en attente',
  },
```

### Step3: ui.ts — EN block
In the `en: { ... }` block, find the last field:
```ts
    whatsapp: 'WhatsApp',
  }
```
Replace with:
```ts
    whatsapp: 'WhatsApp',
    formConsent: 'I agree my details may be used to contact me about my request. See our ',
    privacyLink: 'privacy policy',
    testEmpty: 'Reviews coming soon',
  }
```

### Step4: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors.

### Step5: Commit
```bash
git add src/lib/ultimateTemplate.ts src/lib/template/ui.ts
git commit -m "feat(template): add footerDesc/real-data fields + GDPR/testEmpty labels"
```

## Global Constraints (binding)
- Zero new external dependencies.
- `tsc` must pass.
- Do NOT add eyebrow labels here (Task 6 handles those) — only `formConsent`, `privacyLink`, `testEmpty`.
- Preserve the `as const` on the UI export; new string fields are fine.
