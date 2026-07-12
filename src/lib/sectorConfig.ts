// ============================================================
// LeadForge AI — Sector Configuration Registry
// Central registry for all sector-specific UI/UX customizations
// ============================================================

export interface SectorFormField {
  name: string;
  type: 'text' | 'tel' | 'email' | 'textarea' | 'date' | 'select' | 'number';
  placeholder: { fr: string; en: string };
  required: boolean;
  options?: { fr: string; en: string }[];
}

export interface SectorNavItem {
  label: { fr: string; en: string };
  href: string;
}

export interface SectorStat {
  value: string;
  label: { fr: string; en: string };
}

export interface SectorConfig {
  schemaOrg: string;
  heroBadgeIcon: string;
  heroBadgeText: { fr: string; en: string };
  navItems: SectorNavItem[];
  serviceIcons: string[];
  stats: SectorStat[];
  formFields: SectorFormField[];
  defaultHours: { weekdays: string; saturday: string; sunday: string };
  aboutBadge: { value: string; label: { fr: string; en: string } };
  sections: { process: boolean; whyUs: boolean; stats: boolean; gallery: boolean };
  animationStyle: 'default' | 'energetic' | 'elegant' | 'minimal' | 'warm';
  ui: {
    svcTitle: { fr: string; en: string };
    svcDesc: { fr: string; en: string };
    contactTitle: { fr: string; en: string };
    ctaText: { fr: string; en: string };
    navSpecial?: { fr: string; en: string };
  };
}

export const SECTOR_CONFIG: Record<string, SectorConfig> = {
  restaurant: {
    schemaOrg: 'Restaurant',
    heroBadgeIcon: 'chef-hat',
    heroBadgeText: { fr: 'Chef qualifié', en: 'Qualified Chef' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Menu', en: 'Menu' }, href: '#services' },
      { label: { fr: 'Spécialités', en: 'Specialties' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Réservation', en: 'Reservation' }, href: '#contact' },
    ],
    serviceIcons: ['utensils', 'wine', 'chef-hat', 'concierge-bell', 'package', 'beer'],
    stats: [
      { value: '4.8/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '200+', label: { fr: 'Plats servis/jour', en: 'Dishes served/day' } },
      { value: '100%', label: { fr: 'Fait maison', en: 'Homemade' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'guests', type: 'number', placeholder: { fr: 'Nombre de convives', en: 'Number of guests' }, required: true },
      { name: 'date', type: 'date', placeholder: { fr: 'Date de réservation', en: 'Reservation date' }, required: true },
      { name: 'message', type: 'textarea', placeholder: { fr: 'Allergies, occasion spéciale...', en: 'Allergies, special occasion...' }, required: false },
    ],
    defaultHours: { weekdays: '12h00 – 14h30 / 19h00 – 22h30', saturday: '12h00 – 14h30 / 19h00 – 23h00', sunday: '12h00 – 14h30' },
    aboutBadge: { value: 'Fait maison', label: { fr: 'Depuis 2009', en: 'Since 2009' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'warm',
    ui: {
      svcTitle: { fr: 'Notre Carte', en: 'Our Menu' },
      svcDesc: { fr: 'Des plats préparés avec passion et des produits frais du marché', en: 'Dishes prepared with passion and fresh market produce' },
      contactTitle: { fr: 'Réservation', en: 'Reservation' },
      ctaText: { fr: 'Réserver une table', en: 'Reserve a Table' },
    },
  },

  coiffeur: {
    schemaOrg: 'HealthAndBeautyBusiness',
    heroBadgeIcon: 'scissors',
    heroBadgeText: { fr: 'Coiffeur professionnel', en: 'Professional Stylist' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Services', en: 'Services' }, href: '#services' },
      { label: { fr: 'Galerie', en: 'Gallery' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Prendre RDV', en: 'Book Now' }, href: '#contact' },
    ],
    serviceIcons: ['scissors', 'sparkles', 'palette', 'heart', 'wand-2', 'user-check'],
    stats: [
      { value: '4.9/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '5000+', label: { fr: 'Clients satisfaits', en: 'Happy clients' } },
      { value: '3', label: { fr: 'Coiffeurs', en: 'Stylists' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'service', type: 'select', placeholder: { fr: 'Service souhaité', en: 'Desired service' }, required: true, options: [
        { fr: 'Coupe femme', en: 'Women\'s cut' }, { fr: 'Coupe homme', en: 'Men\'s cut' }, { fr: 'Coloration', en: 'Coloring' },
        { fr: 'Balayage', en: 'Balayage' }, { fr: 'Soin capillaire', en: 'Hair treatment' }, { fr: 'Barbier', en: 'Barber' },
      ]},
      { name: 'date', type: 'date', placeholder: { fr: 'Date souhaitée', en: 'Preferred date' }, required: true },
      { name: 'message', type: 'textarea', placeholder: { fr: 'Demande spéciale...', en: 'Special request...' }, required: false },
    ],
    defaultHours: { weekdays: '09h00 – 19h00', saturday: '09h00 – 18h00', sunday: 'Fermé' },
    aboutBadge: { value: '15+ Ans', label: { fr: 'D\'expérience', en: 'Years Experience' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'elegant',
    ui: {
      svcTitle: { fr: 'Nos Prestations', en: 'Our Services' },
      svcDesc: { fr: 'L\'art de sublimer vos cheveux avec passion et expertise', en: 'The art of enhancing your hair with passion and expertise' },
      contactTitle: { fr: 'Prendre Rendez-vous', en: 'Book Appointment' },
      ctaText: { fr: 'Prendre rendez-vous', en: 'Book Appointment' },
    },
  },

  plomberie: {
    schemaOrg: 'HomeAndConstructionBusiness',
    heroBadgeIcon: 'droplets',
    heroBadgeText: { fr: 'Dépannage rapide garanti', en: 'Fast Emergency Response' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Interventions', en: 'Services' }, href: '#services' },
      { label: { fr: 'Urgence', en: 'Emergency' }, href: '#contact' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Devis', en: 'Quote' }, href: '#contact' },
    ],
    serviceIcons: ['droplets', 'wrench', 'thermometer', 'scan-line', 'bath', 'settings'],
    stats: [
      { value: '4.8/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '<2h', label: { fr: 'Délai d\'intervention', en: 'Response time' } },
      { value: '24h/24', label: { fr: 'Disponible', en: 'Available' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'urgency', type: 'select', placeholder: { fr: 'Type d\'intervention', en: 'Intervention type' }, required: true, options: [
        { fr: 'Urgence (fuite, panne)', en: 'Emergency (leak, breakdown)' }, { fr: 'Installation', en: 'Installation' },
        { fr: 'Entretien', en: 'Maintenance' }, { fr: 'Rénovation', en: 'Renovation' },
      ]},
      { name: 'message', type: 'textarea', placeholder: { fr: 'Décrivez votre problème...', en: 'Describe your issue...' }, required: true },
    ],
    defaultHours: { weekdays: '07h00 – 19h00', saturday: '08h00 – 14h00', sunday: 'Urgences uniquement' },
    aboutBadge: { value: 'Artisan', label: { fr: 'Qualifié', en: 'Certified' } },
    sections: { process: true, whyUs: true, stats: true, gallery: false },
    animationStyle: 'default',
    ui: {
      svcTitle: { fr: 'Nos Interventions', en: 'Our Services' },
      svcDesc: { fr: 'Du dépannage urgent à la rénovation complète, un savoir-faire au service de vos installations', en: 'From emergency repairs to complete renovation, expertise for your plumbing' },
      contactTitle: { fr: 'Demande de Devis', en: 'Request a Quote' },
      ctaText: { fr: 'Demander un devis gratuit', en: 'Get a Free Quote' },
    },
  },

  electricien: {
    schemaOrg: 'HomeAndConstructionBusiness',
    heroBadgeIcon: 'zap',
    heroBadgeText: { fr: 'Électricien certifié', en: 'Certified Electrician' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Services', en: 'Services' }, href: '#services' },
      { label: { fr: 'Réalisations', en: 'Portfolio' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Contact', en: 'Contact' }, href: '#contact' },
    ],
    serviceIcons: ['zap', 'lightbulb', 'plug', 'circuit-board', 'shield-check', 'settings'],
    stats: [
      { value: '4.8/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '500+', label: { fr: 'Installations', en: 'Installations' } },
      { value: '100%', label: { fr: 'Conforme', en: 'Compliant' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'service', type: 'select', placeholder: { fr: 'Type d\'intervention', en: 'Service type' }, required: true, options: [
        { fr: 'Mise aux normes', en: 'Compliance upgrade' }, { fr: 'Dépannage', en: 'Repair' },
        { fr: 'Installation', en: 'Installation' }, { fr: 'Domotique', en: 'Smart home' },
      ]},
      { name: 'message', type: 'textarea', placeholder: { fr: 'Décrivez votre projet...', en: 'Describe your project...' }, required: true },
    ],
    defaultHours: { weekdays: '08h00 – 18h00', saturday: '09h00 – 14h00', sunday: 'Fermé' },
    aboutBadge: { value: 'Consuel', label: { fr: 'Certifié', en: 'Certified' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'default',
    ui: {
      svcTitle: { fr: 'Nos Services', en: 'Our Services' },
      svcDesc: { fr: 'Des installations sûres, conformes et durables pour votre habitat et entreprise', en: 'Safe, compliant, and durable installations for your home and business' },
      contactTitle: { fr: 'Contactez-nous', en: 'Contact Us' },
      ctaText: { fr: 'Contactez-nous', en: 'Contact Us' },
    },
  },

  garage: {
    schemaOrg: 'AutoRepair',
    heroBadgeIcon: 'car',
    heroBadgeText: { fr: 'Garage agréé', en: 'Certified Garage' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Diagnostics', en: 'Diagnostics' }, href: '#services' },
      { label: { fr: 'Réparations', en: 'Repairs' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Prendre RDV', en: 'Book Appointment' }, href: '#contact' },
    ],
    serviceIcons: ['car', 'gauge', 'circle-dot', 'wrench', 'wind', 'clipboard-check'],
    stats: [
      { value: '4.7/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '3000+', label: { fr: 'Véhicules traités/an', en: 'Vehicles/year' } },
      { value: '20+', label: { fr: 'Marques', en: 'Brands' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'vehicle_brand', type: 'text', placeholder: { fr: 'Marque du véhicule', en: 'Vehicle brand' }, required: true },
      { name: 'vehicle_model', type: 'text', placeholder: { fr: 'Modèle', en: 'Model' }, required: false },
      { name: 'service', type: 'select', placeholder: { fr: 'Type d\'intervention', en: 'Service type' }, required: true, options: [
        { fr: 'Diagnostic', en: 'Diagnostic' }, { fr: 'Révision', en: 'Service' },
        { fr: 'Pneumatiques', en: 'Tires' }, { fr: 'Carrosserie', en: 'Body work' },
      ]},
      { name: 'message', type: 'textarea', placeholder: { fr: 'Décrivez le problème...', en: 'Describe the issue...' }, required: false },
    ],
    defaultHours: { weekdays: '08h00 – 18h30', saturday: '09h00 – 13h00', sunday: 'Fermé' },
    aboutBadge: { value: '15+ Ans', label: { fr: 'D\'expérience', en: 'Experience' } },
    sections: { process: true, whyUs: true, stats: true, gallery: false },
    animationStyle: 'default',
    ui: {
      svcTitle: { fr: 'Nos Prestations', en: 'Our Services' },
      svcDesc: { fr: 'Mécanicien passionné, votre véhicule entre de bonnes mains', en: 'Passionate mechanic, your vehicle in good hands' },
      contactTitle: { fr: 'Prendre Rendez-vous', en: 'Book Appointment' },
      ctaText: { fr: 'Demander un RDV', en: 'Book an Appointment' },
    },
  },

  medical: {
    schemaOrg: 'MedicalBusiness',
    heroBadgeIcon: 'stethoscope',
    heroBadgeText: { fr: 'Professionnel de santé', en: 'Healthcare Professional' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Spécialités', en: 'Specialties' }, href: '#services' },
      { label: { fr: 'Équipe', en: 'Team' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Prendre RDV', en: 'Book Appointment' }, href: '#contact' },
    ],
    serviceIcons: ['stethoscope', 'heart-pulse', 'pill', 'thermometer', 'clipboard-list', 'video'],
    stats: [
      { value: '4.9/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '5000+', label: { fr: 'Patients suivis', en: 'Patients treated' } },
      { value: '48h', label: { fr: 'Délai RDV', en: 'Appointment delay' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'consultation_type', type: 'select', placeholder: { fr: 'Type de consultation', en: 'Consultation type' }, required: true, options: [
        { fr: 'Consultation générale', en: 'General consultation' }, { fr: 'Suivi médical', en: 'Follow-up' },
        { fr: 'Bilan de santé', en: 'Health checkup' }, { fr: 'Vaccination', en: 'Vaccination' },
      ]},
      { name: 'date', type: 'date', placeholder: { fr: 'Date souhaitée', en: 'Preferred date' }, required: true },
      { name: 'message', type: 'textarea', placeholder: { fr: 'Motif de la consultation...', en: 'Reason for visit...' }, required: false },
    ],
    defaultHours: { weekdays: '09h00 – 19h00', saturday: '09h00 – 12h00', sunday: 'Fermé' },
    aboutBadge: { value: 'Conventionné', label: { fr: 'Secteur 1', en: 'Sector 1' } },
    sections: { process: true, whyUs: true, stats: true, gallery: false },
    animationStyle: 'minimal',
    ui: {
      svcTitle: { fr: 'Nos Spécialités', en: 'Our Specialties' },
      svcDesc: { fr: 'Votre santé entre les mains de professionnels qualifiés', en: 'Your health in the hands of qualified professionals' },
      contactTitle: { fr: 'Prendre Rendez-vous', en: 'Book Appointment' },
      ctaText: { fr: 'Prendre rendez-vous', en: 'Book Appointment' },
    },
  },

  avocat: {
    schemaOrg: 'LegalService',
    heroBadgeIcon: 'scale',
    heroBadgeText: { fr: 'Avocat au barreau', en: 'Bar Certified Attorney' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Domaines', en: 'Practice Areas' }, href: '#services' },
      { label: { fr: 'Démarche', en: 'Process' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Consultation', en: 'Consultation' }, href: '#contact' },
    ],
    serviceIcons: ['scale', 'book-open', 'briefcase', 'file-text', 'shield-check', 'file-text'],
    stats: [
      { value: '4.9/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '500+', label: { fr: 'Dossiers traités', en: 'Cases handled' } },
      { value: '95%', label: { fr: 'Taux de succès', en: 'Success rate' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: true },
      { name: 'domain', type: 'select', placeholder: { fr: 'Domaine juridique', en: 'Legal area' }, required: true, options: [
        { fr: 'Droit de la famille', en: 'Family law' }, { fr: 'Droit du travail', en: 'Employment law' },
        { fr: 'Droit pénal', en: 'Criminal law' }, { fr: 'Droit des affaires', en: 'Business law' },
      ]},
      { name: 'message', type: 'textarea', placeholder: { fr: 'Décrivez brièvement votre situation...', en: 'Briefly describe your situation...' }, required: true },
    ],
    defaultHours: { weekdays: '09h00 – 18h00', saturday: 'Sur rendez-vous', sunday: 'Fermé' },
    aboutBadge: { value: 'Barreau', label: { fr: 'Inscrit', en: 'Certified' } },
    sections: { process: true, whyUs: true, stats: true, gallery: false },
    animationStyle: 'elegant',
    ui: {
      svcTitle: { fr: 'Domaines de Compétence', en: 'Practice Areas' },
      svcDesc: { fr: 'Conseil juridique personnalisé et défense de vos droits', en: 'Personalized legal advice and defense of your rights' },
      contactTitle: { fr: 'Consultation', en: 'Consultation' },
      ctaText: { fr: 'Prendre rendez-vous', en: 'Book Appointment' },
    },
  },

  spa: {
    schemaOrg: 'HealthAndBeautyBusiness',
    heroBadgeIcon: 'sparkles',
    heroBadgeText: { fr: 'Bien-être & Relaxation', en: 'Wellness & Relaxation' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Soin', en: 'Treatments' }, href: '#services' },
      { label: { fr: 'Ambiance', en: 'Atmosphere' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Réserver', en: 'Book' }, href: '#contact' },
    ],
    serviceIcons: ['sparkles', 'flower-2', 'droplets', 'heart', 'flame', 'leaf'],
    stats: [
      { value: '4.9/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '10+', label: { fr: 'Années', en: 'Years' } },
      { value: '3000+', label: { fr: 'Soins réalisés', en: 'Treatments done' } },
      { value: '100%', label: { fr: 'Détente', en: 'Relaxation' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'treatment', type: 'select', placeholder: { fr: 'Soin souhaité', en: 'Desired treatment' }, required: true, options: [
        { fr: 'Massage relaxant', en: 'Relaxing massage' }, { fr: 'Soin du visage', en: 'Facial treatment' },
        { fr: 'Gommage corps', en: 'Body scrub' }, { fr: 'Manucure & Pédicure', en: 'Manicure & Pedicure' },
      ]},
      { name: 'date', type: 'date', placeholder: { fr: 'Date souhaitée', en: 'Preferred date' }, required: true },
      { name: 'message', type: 'textarea', placeholder: { fr: 'Demande spéciale...', en: 'Special request...' }, required: false },
    ],
    defaultHours: { weekdays: '10h00 – 20h00', saturday: '10h00 – 20h00', sunday: '11h00 – 18h00' },
    aboutBadge: { value: 'Certifié', label: { fr: 'Bien-être', en: 'Wellness' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'elegant',
    ui: {
      svcTitle: { fr: 'Nos Soins', en: 'Our Treatments' },
      svcDesc: { fr: 'Un moment de pur détente pour corps et esprit', en: 'A moment of pure relaxation for body and mind' },
      contactTitle: { fr: 'Réserver un Soin', en: 'Book a Treatment' },
      ctaText: { fr: 'Réserver', en: 'Book Now' },
    },
  },

  fitness: {
    schemaOrg: 'HealthClub',
    heroBadgeIcon: 'dumbbell',
    heroBadgeText: { fr: 'Coach diplômé', en: 'Certified Coach' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Programmes', en: 'Programs' }, href: '#services' },
      { label: { fr: 'Coachs', en: 'Coaches' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Essai Gratuit', en: 'Free Trial' }, href: '#contact' },
    ],
    serviceIcons: ['dumbbell', 'heart-pulse', 'timer', 'trophy', 'flame', 'sparkles'],
    stats: [
      { value: '4.8/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '500+', label: { fr: 'Membres actifs', en: 'Active members' } },
      { value: '20+', label: { fr: 'Cours/semaine', en: 'Classes/week' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'program', type: 'select', placeholder: { fr: 'Programme intéressé', en: 'Interested program' }, required: true, options: [
        { fr: 'Musculation', en: 'Weight training' }, { fr: 'Coach Personnel', en: 'Personal Training' },
        { fr: 'Cours Collectifs', en: 'Group classes' }, { fr: 'Cardio', en: 'Cardio' },
      ]},
      { name: 'date', type: 'date', placeholder: { fr: 'Date d\'essai', en: 'Trial date' }, required: false },
      { name: 'message', type: 'textarea', placeholder: { fr: 'Vos objectifs...', en: 'Your goals...' }, required: false },
    ],
    defaultHours: { weekdays: '06h00 – 22h00', saturday: '08h00 – 20h00', sunday: '09h00 – 18h00' },
    aboutBadge: { value: 'Coachs', label: { fr: 'Diplômés d\'État', en: 'State Certified' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'energetic',
    ui: {
      svcTitle: { fr: 'Nos Programmes', en: 'Our Programs' },
      svcDesc: { fr: 'Votre coach personnel pour atteindre vos objectifs fitness', en: 'Your personal coach to reach your fitness goals' },
      contactTitle: { fr: 'Essai Gratuit', en: 'Free Trial' },
      ctaText: { fr: 'Essai offert', en: 'Free Trial' },
    },
  },

  nettoyage: {
    schemaOrg: 'HomeAndConstructionBusiness',
    heroBadgeIcon: 'sparkles',
    heroBadgeText: { fr: 'Service nettoyage pro', en: 'Professional Cleaning' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Services', en: 'Services' }, href: '#services' },
      { label: { fr: 'Méthode', en: 'Method' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Devis', en: 'Quote' }, href: '#contact' },
    ],
    serviceIcons: ['sparkles', 'spray-can', 'shower-head', 'shield-check', 'recycle', 'check-circle'],
    stats: [
      { value: '4.8/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '200+', label: { fr: 'Clients réguliers', en: 'Regular clients' } },
      { value: '100%', label: { fr: 'Écolabel', en: 'Eco-certified' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'service_type', type: 'select', placeholder: { fr: 'Type de nettoyage', en: 'Cleaning type' }, required: true, options: [
        { fr: 'Bureaux', en: 'Offices' }, { fr: 'Résidentiel', en: 'Residential' },
        { fr: 'Vitres', en: 'Windows' }, { fr: 'Industriel', en: 'Industrial' },
      ]},
      { name: 'message', type: 'textarea', placeholder: { fr: 'Surface approximative, fréquence...', en: 'Approximate area, frequency...' }, required: true },
    ],
    defaultHours: { weekdays: '07h00 – 19h00', saturday: '08h00 – 14h00', sunday: 'Fermé' },
    aboutBadge: { value: 'Écolabel', label: { fr: 'Certifié', en: 'Certified' } },
    sections: { process: true, whyUs: true, stats: true, gallery: false },
    animationStyle: 'minimal',
    ui: {
      svcTitle: { fr: 'Nos Services', en: 'Our Services' },
      svcDesc: { fr: 'Propreté professionnelle et écologique pour vos espaces', en: 'Professional and eco-friendly cleanliness for your spaces' },
      contactTitle: { fr: 'Demander un Devis', en: 'Request a Quote' },
      ctaText: { fr: 'Demander un devis', en: 'Request a Quote' },
    },
  },

  jardin: {
    schemaOrg: 'HomeAndConstructionBusiness',
    heroBadgeIcon: 'leaf',
    heroBadgeText: { fr: 'Jardinier expert', en: 'Expert Gardener' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Services', en: 'Services' }, href: '#services' },
      { label: { fr: 'Réalisations', en: 'Portfolio' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Devis', en: 'Quote' }, href: '#contact' },
    ],
    serviceIcons: ['tree-pine', 'flower-2', 'scissors', 'sun', 'droplets', 'fence'],
    stats: [
      { value: '4.9/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '300+', label: { fr: 'Jardins entretenus', en: 'Gardens maintained' } },
      { value: '100%', label: { fr: 'Satisfait', en: 'Satisfied' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'service', type: 'select', placeholder: { fr: 'Type de prestation', en: 'Service type' }, required: true, options: [
        { fr: 'Création jardin', en: 'Garden creation' }, { fr: 'Tonte & Entretien', en: 'Mowing & Maintenance' },
        { fr: 'Élagage', en: 'Pruning' }, { fr: 'Arrosage auto', en: 'Automatic watering' },
      ]},
      { name: 'message', type: 'textarea', placeholder: { fr: 'Décrivez votre projet...', en: 'Describe your project...' }, required: true },
    ],
    defaultHours: { weekdays: '08h00 – 18h00', saturday: '08h00 – 14h00', sunday: 'Fermé' },
    aboutBadge: { value: 'Paysagiste', label: { fr: 'Qualifié', en: 'Qualified' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'warm',
    ui: {
      svcTitle: { fr: 'Nos Services', en: 'Our Services' },
      svcDesc: { fr: 'Création et entretien de jardins uniques et harmonieux', en: 'Creation and maintenance of unique, harmonious gardens' },
      contactTitle: { fr: 'Demander un Devis', en: 'Request a Quote' },
      ctaText: { fr: 'Demander un devis', en: 'Request a Quote' },
    },
  },

  default: {
    schemaOrg: 'LocalBusiness',
    heroBadgeIcon: 'badge-check',
    heroBadgeText: { fr: 'Professionnel certifié', en: 'Certified Professional' },
    navItems: [
      { label: { fr: 'À propos', en: 'About' }, href: '#about' },
      { label: { fr: 'Services', en: 'Services' }, href: '#services' },
      { label: { fr: 'Notre Approche', en: 'Our Approach' }, href: '#why' },
      { label: { fr: 'Avis', en: 'Reviews' }, href: '#testimonials' },
      { label: { fr: 'Contact', en: 'Contact' }, href: '#contact' },
    ],
    serviceIcons: ['shield-check', 'wrench', 'home', 'award', 'clock', 'check-circle'],
    stats: [
      { value: '4.8/5', label: { fr: 'Note Google', en: 'Google Rating' } },
      { value: '15+', label: { fr: 'Années', en: 'Years' } },
      { value: '500+', label: { fr: 'Clients satisfaits', en: 'Happy clients' } },
      { value: '100%', label: { fr: 'Satisfaction', en: 'Satisfaction' } },
    ],
    formFields: [
      { name: 'name', type: 'text', placeholder: { fr: 'Votre nom', en: 'Your name' }, required: true },
      { name: 'phone', type: 'tel', placeholder: { fr: 'Téléphone', en: 'Phone' }, required: true },
      { name: 'email', type: 'email', placeholder: { fr: 'Email', en: 'Email' }, required: false },
      { name: 'message', type: 'textarea', placeholder: { fr: 'Décrivez votre besoin...', en: 'Describe your needs...' }, required: true },
    ],
    defaultHours: { weekdays: '08h00 – 18h00', saturday: '09h00 – 14h00', sunday: 'Fermé' },
    aboutBadge: { value: '15+ Ans', label: { fr: 'D\'expérience', en: 'Experience' } },
    sections: { process: true, whyUs: true, stats: true, gallery: true },
    animationStyle: 'default',
    ui: {
      svcTitle: { fr: 'Nos Services', en: 'Our Services' },
      svcDesc: { fr: 'Un service de qualité, à l\'écoute de vos besoins', en: 'Quality service, attentive to your needs' },
      contactTitle: { fr: 'Contactez-nous', en: 'Contact Us' },
      ctaText: { fr: 'Contactez-nous', en: 'Contact Us' },
    },
  },
};

export function getSectorConfig(sector: string): SectorConfig {
  const s = (sector || '').toLowerCase();
  if (s.includes('restaurant') || s.includes('cuisin') || s.includes('traiteur') || s.includes('boulanger') || s.includes('pâtissier') || s.includes('patisserie') || s.includes('pizzeria') || s.includes('café') || s.includes('cafe') || s.includes('brasserie') || s.includes('bar ') || s.includes('glacier') || s.includes('poissonnerie') || s.includes('boucherie') || s.includes('charcuterie')) return SECTOR_CONFIG.restaurant;
  if (s.includes('coiff') || s.includes('barb') || s.includes('salon') || s.includes('beauté') || s.includes('beaute') || s.includes('esthétique') || s.includes('esthetique') || s.includes('ongle') || s.includes('tatou')) return SECTOR_CONFIG.coiffeur;
  if (s.includes('plomb') || s.includes('chauffage') || s.includes('clim') || s.includes('chaud') || s.includes('pompe à chaleur') || s.includes('pompe a chaleur')) return SECTOR_CONFIG.plomberie;
  if (s.includes('électricien') || s.includes('electricien') || s.includes('electric') || s.includes('électri') || s.includes('electri') || s.includes('peintre') || s.includes('platrier') || s.includes('couvreur') || s.includes('maçon') || s.includes('macon') || s.includes('rénov') || s.includes('renov') || s.includes('menuisier') || s.includes('charpentier') || s.includes('serrurier')) return SECTOR_CONFIG.electricien;
  if (s.includes('garage') || s.includes('mécan') || s.includes('mecan') || s.includes('auto') || s.includes('carrosserie') || s.includes('pneu') || s.includes('véhicule') || s.includes('vehicule') || s.includes('camion') || s.includes('moto') || s.includes('transport') || s.includes('livraison') || s.includes('déménage') || s.includes('demenage') || s.includes('taxi') || s.includes('vTC') || s.includes('vtc')) return SECTOR_CONFIG.garage;
  if (s.includes('médec') || s.includes('clinique') || s.includes('dentiste') || s.includes('santé') || s.includes('sante') || s.includes('kiné') || s.includes('pharmac') || s.includes('opticien') || s.includes('infirm') || s.includes('ostéo') || s.includes('sage-femme')) return SECTOR_CONFIG.medical;
  if (s.includes('avocat') || s.includes('notaire') || s.includes('juridi') || s.includes('droit') || s.includes('huissier')) return SECTOR_CONFIG.avocat;
  if (s.includes('spa') || s.includes('massage') || s.includes('wellness') || s.includes('détente') || s.includes('detente')) return SECTOR_CONFIG.spa;
  if (s.includes('coach') || s.includes('sport') || s.includes('fitness') || s.includes('salle') || s.includes('musculation') || s.includes('yoga') || s.includes('crossfit') || s.includes('boxe')) return SECTOR_CONFIG.fitness;
  if (s.includes('nettoyag') || s.includes('propreté') || s.includes('ménage') || s.includes('menage') || s.includes('menager') || s.includes('hygiène') || s.includes('hygiene')) return SECTOR_CONFIG.nettoyage;
  if (s.includes('jardin') || s.includes('paysag') || s.includes('espaces verts') || s.includes('espace vert') || s.includes('pépinière') || s.includes('arbori') || s.includes('arrosage') || s.includes('fleuriste') || s.includes('fleur')) return SECTOR_CONFIG.jardin;
  return SECTOR_CONFIG.default;
}
