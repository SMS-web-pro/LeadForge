### Task 6: Why (dark) checklist enrichment

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` â€” `#why` block (lines ~1583-1597).

**Interfaces:**
- Consumes: `pack.whyUs`.
- Produces: `.why-list` checklist beside why-image.

- [ ] **Step 1: Write the failing test**

```ts
it('why section lists key reasons', () => {
  const html = build();
  expect(html).toContain('why-list');
  expect(html).toMatch(/class="[^"]*why-list-item[^"]*"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`why-list` absent).

- [ ] **Step 3: Write minimal implementation**

In `#why`, after the `.why-text` `<p>` (line ~1589), add:

```ts
                    <ul class="why-list">
                        ${pack.whyUs.slice(0, 3).map((w: any) => `<li class="why-list-item"><i data-lucide="check" width="16"></i> <span><strong>${w.title}</strong> â€” ${w.desc}</span></li>`).join('')}
                    </ul>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add key-reasons checklist to Why section"
```

---

