### Task 3: Hero USP chips

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` â€” `buildHero` (after `.hero-actions`).

**Interfaces:**
- Consumes: `getGuarantees(content.sector, lang)`, `t`, `ui`.
- Produces: extra `.hero-chips` markup in hero.

- [ ] **Step 1: Write the failing test**

```ts
it('hero shows USP chips from guarantees', () => {
  const html = build();
  expect(html).toContain('hero-chips');
  expect(html).toMatch(/class="[^"]*hero-chip[^"]*"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`hero-chips` absent).

- [ ] **Step 3: Write minimal implementation**

In `buildHero`, after the `.hero-actions` block (the `</div>` closing `.hero-actions` at line ~739), insert before the rating `<div>`:

```ts
                <div class="hero-chips">
                    ${getGuarantees(content.sector, lang).slice(0, 3).map((g: any) => `<span class="hero-chip"><i data-lucide="${g.icon}" width="14"></i> ${g.title}</span>`).join('')}
                </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add hero USP chips"
```

---

