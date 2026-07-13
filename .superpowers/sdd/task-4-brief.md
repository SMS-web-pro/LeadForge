### Task 4: Services "Popular" tag + richer copy

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` â€” `buildServices` card map.

**Interfaces:**
- Consumes: `serviceDescs`, existing cards.
- Produces: `.svc-tag` on first card.

- [ ] **Step 1: Write the failing test**

```ts
it('marks the first service as popular and uses richer descriptions', () => {
  const html = build();
  expect(html).toContain('svc-tag');
  expect(html).toContain('svc-card-body');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`svc-tag` absent).

- [ ] **Step 3: Write minimal implementation**

In `buildServices`, change the card template to add a tag on `i === 0`:

```ts
                return `
                <div class="svc-card reveal reveal-d${(i % 3) + 1}">
                    ${i === 0 ? `<div class="svc-tag">${ui.svcPopular || (lang === 'fr' ? 'Populaire' : 'Popular')}</div>` : ''}
                    <img src="${proxiedImg(serviceImages[i] || heroImage)}" class="svc-card-img" alt="${s.name} Ã  ${city}" loading="lazy">
                    <div class="svc-card-body">
                        <div class="svc-icon"><i data-lucide="${iconName}" width="22" height="22"></i></div>
                        <h3>${s.name}</h3>
                        <p>${serviceDescs[i]?.desc || s.description}</p>
                        <a href="#contact" class="svc-link">${ui.svcLink} <i data-lucide="arrow-right" width="14"></i></a>
                    </div>
                </div>`;
```

(If `ui.svcPopular` is undefined, the fallback inline copy is used.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add Popular tag + ensure richer service copy"
```

---

