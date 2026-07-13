### Task 9: Full verification + honesty re-check

**Files:**
- Test: `src/lib/__tests__/template-design.test.ts` (already extended in Tasks 1-7)
- Script: `test-site-gen.mts`

- [ ] **Step 1: Run typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no output.

- [ ] **Step 2: Run the full design test suite**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: all tests PASS (existing 12 + new from Tasks 1-7).

- [ ] **Step 3: Regenerate all 10 sectors and assert honesty**

Run: `npx tsx test-site-gen.mts`
Expected: exit 0, all assertions true.

- [ ] **Step 4: Grep generated HTML for forbidden patterns**

Run (PowerShell):
```powershell
Get-ChildItem test-*-*.html | ForEach-Object {
  $c = (Get-Content $_.FullName -Raw)
  if ($c -match 'Avis en attente') { Write-Error "FAIL $($_.Name): Avis en attente" }
  if ($c -match 'undefined|NaN') { Write-Error "FAIL $($_.Name): undefined/NaN" }
}
Write-Output "honesty check done"
```
Expected: "honesty check done" only, no FAIL.

- [ ] **Step 5: Commit any final sample HTML updates**

```bash
git add test-*.html
git commit -m "chore(samples): regenerate enriched sites"
```

---

## Self-Review Notes

- Spec coverage: Â§4.1 (testimonials) â†’ Task 1; Â§4.2 (process) â†’ Task 2; Â§5 hero/services/about/why â†’ Tasks 3-6; Â§6 (CSS) â†’ Task 7; Â§7 (sample data) â†’ Task 8; Â§8/Â§9 (tests/verify) â†’ Tasks 1-9. Contact map already exists (line 905) â€” out of scope, no new task.
- Honesty: every new branch gates on real data; the no-data branch shows a CTA + real trust badges only. Tests in Task 1 explicitly forbid fabricated stars/counts.
- Type consistency: `buildTestimonials(content, lang)` and `buildProcess(content, lang)` signatures match their call sites; `pack.bespoke` used for skip logic matches the `SectorCopy.bespoke` union extended earlier.
- No placeholders: each step shows concrete code or exact commands.
