### Task 2: Universal "Comment Ã§a marche" section (`#process`)

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` â€” add `buildProcess`; wire into assembly with skip logic.
- Test: `src/lib/__tests__/template-design.test.ts`

**Interfaces:**
- Consumes: `content.sector`, `pack`, `t()`, `ui`.
- Produces: `buildProcess(content, lang)`; assembly variable `hasBespokeProcess`.

- [ ] **Step 1: Write the failing test**

```ts
it('shows #process for non-bespoke sectors and hides it for bespoke-process sectors', () => {
  const electricien = generateUltimateSite(lead as any, undefined);
  expect(electricien).toContain('id="process"');
  const coiffeur = generateUltimateSite({ ...lead, sector: 'Coiffeur' } as any, undefined);
  expect(coiffeur).not.toContain('id="process"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (no `id="process"`).

- [ ] **Step 3: Write minimal implementation**

Add the builder (near `buildTestimonials`):

```ts
  function buildProcess(content: UltimateContent, lang: 'fr' | 'en'): string {
    const steps = [
      { icon: 'message-circle', label: t('Consultation', 'Consultation'), desc: t(`Un Ã©change pour comprendre vos besoins en ${content.sector}.`, `A conversation to understand your ${content.sector} needs.`) },
      { icon: 'settings', label: t('RÃ©alisation', 'Delivery'), desc: t('Une intervention soignÃ©e, dans les rÃ¨gles de lâ€™art.', 'Careful work, done right.') },
      { icon: 'refresh-cw', label: t('Suivi', 'Follow-up'), desc: t('Un accompagnement aprÃ¨s lâ€™intervention, sans surprise.', 'Support after the job, with no surprises.') },
    ];
    return `    <section class="section" id="process">
        <div class="container">
            <div class="section-hdr reveal">
                <span class="section-label">${ui.eyebrowServices}</span>
                <h2>${t('Comment Ã§a marche', 'How it works')}</h2>
                <p>${t('Un process clair, de la premiÃ¨re demande Ã  la finition.', 'A clear process, from first contact to the finished result.')}</p>
            </div>
            <div class="bespoke-progs reveal">${steps.map(s => `
                <div class="bespoke-prog reveal">
                    <div class="bespoke-prog-icon"><i data-lucide="${s.icon}" width="22"></i></div>
                    <h3>${s.label}</h3>
                    <p>${s.desc}</p>
                </div>`).join('')}</div>
        </div>
    </section>`;
  }
```

In the assembly (after `const bespokeSection = buildBespoke(...)` and before/after it), compute:

```ts
const hasBespokeProcess = ['coiffeur', 'avocat', 'nettoyage', 'jardin', 'garage', 'coach'].includes(pack.bespoke || '');
```

Insert into the assembly right after `${bespokeSection}`:

```ts
${!hasBespokeProcess ? buildProcess(content, lang) : ''}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "feat(template): add universal Comment Ã§a marche section (skips bespoke-process sectors)"
```

---

