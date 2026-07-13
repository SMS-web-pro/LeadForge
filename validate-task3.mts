import { resolveSectorContent } from './src/lib/template/sectorContent.ts';

type Lang = 'fr' | 'en';
const keys = [
  'electricien', 'plombier', 'coiffeur', 'restaurant', 'dentiste', 'avocat',
  'nettoyage', 'jardin', 'coach', 'garage', 'medical', 'artisan', 'default',
];
const langs: Lang[] = ['fr', 'en'];
const ratingRe = /^\s*\d+([.,]\d+)?\s*\/\s*5\s*$/;
const pctRe = /\d+\s*%/;
let problems = 0;

for (const k of keys) {
  for (const l of langs) {
    const p = resolveSectorContent(k, l);
    const issues: string[] = [];
    if (!p.whyUs || p.whyUs.length < 3) issues.push(`whyUs<3 (${p.whyUs?.length})`);
    if (!p.services || p.services.length < 3) issues.push(`services<3 (${p.services?.length})`);
    if (!p.faq || p.faq.length < 2) issues.push(`faq<2 (${p.faq?.length})`);
    if (!p.trustBadges || p.trustBadges.length < 3) issues.push(`trustBadges<3 (${p.trustBadges?.length})`);
    for (const b of p.trustBadges || []) {
      if (ratingRe.test(b) || pctRe.test(b)) issues.push(`numeric/fabricated badge: "${b}"`);
    }
    const text = [...(p.whyUs || []).map(x => x.title + ' ' + x.desc),
      ...(p.services || []).map(x => x.name + ' ' + x.desc),
      ...(p.faq || []).map(x => x.q + ' ' + x.a)].join(' ');
    if (/undefined|NaN/.test(text)) issues.push('undefined/NaN in text');
    if (issues.length) {
      problems++;
      console.log(`FAIL ${k}/${l}: ${issues.join('; ')}`);
    } else {
      console.log(`ok   ${k}/${l}: whyUs=${p.whyUs.length} svc=${p.services.length} faq=${p.faq.length} badges=${p.trustBadges.length} bespoke=${p.bespoke}`);
    }
  }
}
console.log(problems ? `\n${problems} PACK PROBLEMS` : '\nALL TASK-3 PACKS VALID');
process.exit(problems ? 1 : 0);
