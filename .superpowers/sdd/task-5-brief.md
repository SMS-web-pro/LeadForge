# Task 5 — Light custom-cursor "Vibe" (guarded)

**Source:** docs/superpowers/plans/2026-07-12-soft-evolution-redesign.md (Task 5)

## Files
- Modify: `src/lib/ultimateTemplate.ts` — (A) INSERT `.cursor-dot` CSS after the `.float-urgent` media query; (B) EXTEND the `<script>` block by inserting a guarded cursor IIFE after `lucide.createIcons();`.

## Interfaces
- Consumes (Task 1): `--primary`, `--accent-dark`, `--ease`, `--dur`. (Task 4) reduced-motion media query.
- Produces: subtle follower dot; active ONLY on fine-pointer, non-reduced-motion, ≥768px.

## Steps

### Step1: Add cursor CSS
In `src/lib/ultimateTemplate.ts`, locate this EXACT line:
```css
@media(max-width:768px){.float-urgent{bottom:20px;right:20px;padding:14px 22px;font-size:.85rem}}
```
Immediately AFTER it, insert:
```css
.cursor-dot{position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;background:var(--accent-dark);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .2s var(--ease),height .2s var(--ease),background .2s var(--ease);mix-blend-mode:difference;opacity:0}
.cursor-dot.is-active{opacity:1}
.cursor-dot.is-hover{width:34px;height:34px;background:rgba(255,255,255,.6)}
@media(pointer:coarse),(max-width:767px),(prefers-reduced-motion:reduce){.cursor-dot{display:none!important}}
```

### Step2: Extend the `<script>` block
Locate the line inside the `<script>` (near the bottom of the template string):
```javascript
        lucide.createIcons();
```
Immediately AFTER it, insert this IIFE (preserve the existing lines that follow):
```javascript
        (function(){
          var fine = window.matchMedia('(pointer:fine)').matches;
          var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
          if(!fine || reduce) return;
          var dot=document.createElement('div');dot.className='cursor-dot';document.body.appendChild(dot);
          window.addEventListener('mousemove',function(e){dot.classList.add('is-active');dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px';});
          window.addEventListener('mouseover',function(e){if(e.target.closest('a,button,[role="button"],input,textarea,select,.svc-card,.guar-card,.test-card'))dot.classList.add('is-hover');});
          window.addEventListener('mouseout',function(e){if(e.target.closest('a,button,[role="button"],input,textarea,select,.svc-card,.guar-card,.test-card'))dot.classList.remove('is-hover');});
          document.addEventListener('mouseleave',function(){dot.classList.remove('is-active');});
        })();
```

### Step3: Typecheck
Run: `npx tsc --noEmit` (repo root). Expected: 0 errors (the script is inside a JS string).

### Step4: Commit
```bash
git add src/lib/ultimateTemplate.ts
git commit -m "feat(template): subtle guarded custom-cursor Vibe"
```

## Global Constraints (binding)
- Single `<h1>` per page — no h1 change.
- All interactive elements: `cursor:pointer`, visible `:focus-visible` ring, hover transition 150–300ms (cursor dot transition uses `--dur`=220ms ✓).
- No emoji icons — lucide only.
- Light-mode contrast ≥4.5:1; no neon; no AI purple-pink gradients.
- Responsive 375/768/1024/1440.
- Custom cursor + reveals MUST be auto-disabled when `prefers-reduced-motion: reduce` OR `pointer: coarse` OR viewport < 768px — the CSS `@media(pointer:coarse),(max-width:767px),(prefers-reduced-motion:reduce){.cursor-dot{display:none!important}}` AND the JS `if(!fine || reduce) return;` BOTH enforce this. Confirm both are present.
- Zero new external dependencies.
- `tsc` must pass.
