### Task 8: Inject sample data in `test-site-gen.mts` (preview only)

**Files:**
- Modify: `test-site-gen.mts`

**Interfaces:**
- Consumes: existing sample lead builder.
- Produces: sample `googleReviewsData`, `googleRating`, `googleReviews`, `reviewUrl`, `serviceAreas`, `hours`, `establishedYear` per sector.

- [ ] **Step 1: Add sample review data to the generator**

In `test-site-gen.mts`, where each sample `lead` is built, add fields (example for electricien; replicate per sector with sector-appropriate copy):

```ts
const sampleReviews = (sector: string) => ([
  { author: 'Julie M.', text: `Intervention rapide et propre, je recommande ce ${sector}.`, rating: 5, date: '2025-11-02' },
  { author: 'Karim B.', text: 'Devis clair, travail soignÃ©, rien Ã  redire.', rating: 5, date: '2025-09-18' },
  { author: 'Sophie T.', text: 'Ã‰quipe Ã  lâ€™Ã©coute et rÃ©sultat au rendez-vous.', rating: 4, date: '2025-07-30' },
]);
// in each lead object:
googleRating: 4.7,
googleReviews: 124,
googleReviewsData: sampleReviews(sector.toLowerCase()),
reviewUrl: 'https://search.google.com/local/writereview?placeid=CHANGE_ME',
establishedYear: 2011,
hours: 'Lun-Sam 08h-19h',
```

(Values are clearly sample/preview only; they exercise the real-data branches. Do NOT change `generateUltimateSite` gating.)

- [ ] **Step 2: Regenerate and confirm no errors**

Run: `npx tsx test-site-gen.mts`
Expected: all 10 sectors green, no exceptions.

- [ ] **Step 3: Commit**

```bash
git add test-site-gen.mts
git commit -m "chore(samples): inject sample reviews/rating/hours for preview"
```

---

