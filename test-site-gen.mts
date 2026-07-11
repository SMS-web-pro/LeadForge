import { generateUltimateSiteAsync } from './src/lib/ultimateTemplate.ts';
import { writeFileSync } from 'fs';

const leads = [
  {
    name: 'Electra Paris Électricité',
    sector: 'Électricien',
    city: 'Paris',
    phone: '+33 1 84 80 00 00',
    email: 'contact@electra-paris.fr',
    address: '12 Rue de Rivoli',
    googleRating: 4.8,
    googleReviews: 127,
    description: "Électricien certifié RGE intervenant à Paris pour dépannage, mise aux normes et domotique.",
    website: 'https://electra-paris.fr',
    hours: 'Lun-Ven 08h-19h · Sam 09h-13h',
    establishedYear: 2009,
    out: 'test-electricien-paris.html',
  },
  {
    name: 'Proxi Eau Plomberie',
    sector: 'Plombier',
    city: 'Lyon',
    phone: '+33 4 72 00 00 00',
    email: 'contact@proxieau.fr',
    address: '5 Cours Lafayette',
    googleRating: 4.6,
    googleReviews: 89,
    description: "Plombier chauffagiste à Lyon : dépannage urgence, fuites, rénovation salle de bain.",
    website: 'https://proxieau.fr',
    hours: 'Lun-Sam 07h30-20h',
    establishedYear: 2015,
    out: 'test-plombier-lyon.html',
  },
];

for (const lead of leads) {
  const html = await generateUltimateSiteAsync(lead, undefined, '');
  writeFileSync(lead.out, html);

  const heroImg = (html.match(/<img[^>]*class="hero-bg"[^>]*src="([^"]+)"/) || html.match(/<img[^>]*src="([^"]+)"[^>]*class="hero-bg"/) || [])[1] || 'NONE';
  const iconMatch = html.match(/navbar-logo"><i data-lucide="([a-z-]+)"/);
  const checks = {
    file: lead.out,
    length: html.length,
    hasWhySection: html.includes('Pourquoi nous choisir'),
    noRealisations: !html.includes('Nos Réalisations'),
    hasFAQ: html.includes('Questions fréquentes') && html.includes(lead.city),
    fullNameShown: html.includes(lead.name),
    navbarIcon: iconMatch ? iconMatch[1] : 'NONE',
    noLogoInitialsBox: !new RegExp(`navbar-logo">[A-Z]{2}</div>`).test(html),
    hasReveal: html.includes('class="reveal'),
    noUndefined: !html.includes('undefined'),
    noNaN: !html.includes('NaN'),
    heroImgIsImg: heroImg.startsWith('https://'),
  };
  console.log(JSON.stringify(checks, null, 2));
  console.log('HERO_IMG:', heroImg.slice(0, 100));
}
