### Task 7: CSS densification + visual upgrade

**Files:**
- Modify: `src/lib/ultimateTemplate.ts` â€” the `<style>` literal (`:root` token at ~1117, `.section` ~1227, `.hero-mesh` ~1188, `.hero-inner` ~1195, `.section-hdr`/headings, `.svc-grid` ~1267 gaps).

**Interfaces:**
- Consumes: existing CSS classes; new classes used above (`.hero-chips`,`.hero-chip`,`.svc-tag`,`.about-mini`,`.why-list`,`.tcard*`,`.tcard-grid`).
- Produces: smaller `--section-py`, tighter gaps, stronger hero mesh, editorial heading marks, new component CSS.

- [ ] **Step 1: Write the failing test**

```ts
it('densifies section padding via --section-py token', () => {
  const html = build();
  const m = html.match(/--section-py:([^;]+);/);
  expect(m).toBeTruthy();
  // max clamp value should be reduced (was 120px) -> assert "<= 96px"
  const maxv = parseInt((m as RegExpMatchArray)[1].match(/(\d+)px\s*\)/) as any, 10);
  expect(maxv).toBeLessThanOrEqual(96);
});
it('defines CSS for new enriched components', () => {
  const html = build();
  ['hero-chips', 'svc-tag', 'about-mini', 'why-list', 'tcard-grid'].forEach(c => expect(html).toContain(c));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: FAIL (`--section-py` max still 120; some classes lack CSS).

- [ ] **Step 3: Write minimal implementation**

a) Change the `:root` token (line 1117): `--section-py:clamp(64px,9vw,120px)` â†’ `--section-py:clamp(52px,6vw,88px)`.

b) Strengthen hero mesh (line ~1188) â€” keep the existing multi-stop gradient but raise opacity/contrast; ensure `.hero-mesh{opacity:.9}` (a line at ~1426 already forces `.hero-mesh{opacity:.8!important}` â€” leave it). No change required if acceptable; otherwise bump the gradient alpha. Keep as-is if risky.

c) Add component CSS (append near the end of the `<style>` block, before `</style>`):

```css
.hero-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.hero-chip{display:inline-flex;align-items:center;gap:6px;font-size:.82rem;color:rgba(255,255,255,.86);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);padding:7px 14px;border-radius:999px;backdrop-filter:blur(6px)}
.svc-tag{position:absolute;top:14px;left:14px;background:var(--accent);color:#fff;font-size:.7rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:5px 12px;border-radius:999px;z-index:2}
.svc-card{position:relative}
.about-sub{margin-top:14px;color:var(--text-s)}
.about-mini{display:flex;flex-wrap:wrap;gap:26px;margin-top:24px}
.about-mini-item{display:flex;flex-direction:column}.about-mini-item strong{font-size:1.6rem;color:var(--primary)}.about-mini-item span{font-size:.8rem;color:var(--text-t);text-transform:uppercase;letter-spacing:.06em}
.why-list{list-style:none;margin:20px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}
.why-list-item{display:flex;gap:10px;align-items:flex-start;font-size:.96rem}.why-list-item i{color:var(--accent);margin-top:3px;flex:0 0 auto}
.tcard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.tcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;box-shadow:var(--sh-1)}
.tcard-stars{color:var(--accent);letter-spacing:2px;margin-bottom:10px}
.tcard-text{font-size:.96rem;line-height:1.6;color:var(--text)}
.tcard-foot{display:flex;justify-content:space-between;margin-top:14px;font-size:.82rem;color:var(--text-t)}
.tcard-author{font-weight:600;color:var(--text)}
@media(max-width:768px){.tcard-grid{grid-template-columns:1fr}}
.section-hdr h2{position:relative;display:inline-block}
.section-hdr h2::after{content:"";position:absolute;left:0;bottom:-10px;width:54px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--secondary))}
```

d) Tighten `.svc-grid` gap (line 1267): `gap:28px` â†’ `gap:20px`. Tighten `.guar-grid` (line 1311) `gap:22px` â†’ `gap:18px`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-design.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ultimateTemplate.ts src/lib/__tests__/template-design.test.ts
git commit -m "style(template): densify layout + upgrade visuals (chips, tags, mini-stats, testimonials grid)"
```

---

