// ============================================================
// LeadForge AI — Website Generator
// Générateur de sites web complet avec traitement intelligent des images
// ============================================================

import { getSectorImages, SECTOR_PEXELS_IMAGES } from './pexelsImages';
import { getImagesForLead } from './pexelsApi';
import { websiteGenState } from './websitegen-state';
import { generateUltimateSiteAsync } from './ultimateTemplate';

// ── INTERFACES PRINCIPALES ──

export interface LeadData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  sector: string;
  city: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  images?: string[];
  agentId?: string;
}

export interface WebsiteGenerationOptions {
  template?: 'ultimate' | 'modern' | 'sector';
  language?: 'fr' | 'en';
  includeAnalytics?: boolean;
  includeChatbot?: boolean;
  includeWhatsApp?: boolean;
  customStyles?: Record<string, any>;
}

export interface GeneratedWebsite {
  html: string;
  css: string;
  js: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    favicon?: string;
    openGraph?: Record<string, string>;
  };
  assets: {
    images: string[];
    fonts: string[];
    scripts: string[];
  };
}

// ── CLASSE PRINCIPALE WebsiteGenerator ──

export class WebsiteGenerator {
  private leadData: LeadData;
  private options: WebsiteGenerationOptions;
  private processedImages: ProcessedImage[] = [];

  constructor(leadData: LeadData, options: WebsiteGenerationOptions = {}) {
    this.leadData = leadData;
    this.options = {
      template: 'ultimate',
      language: 'fr',
      includeAnalytics: true,
      includeChatbot: true,
      includeWhatsApp: true,
      ...options
    };
  }

  // ── MÉTHODE PRINCIPALE DE GÉNÉRATION ──
  async generateWebsite(): Promise<GeneratedWebsite> {
    const agentId = this.leadData.agentId || 'default';
    
    try {
      // Démarrer le processing
      websiteGenState.startProcessing('Génération du site web', agentId);

      // Étape 1: Traitement des images
      websiteGenState.updateProgress({
        current: 1,
        total: 5,
        name: 'Traitement des images',
        step: 'Analyse des images du prospect'
      });
      
      await this.processImages();

      // Étape 2: Génération du HTML
      websiteGenState.updateProgress({
        current: 2,
        total: 5,
        name: 'Génération HTML',
        step: 'Création de la structure HTML'
      });

      const html = await this.generateHTML();

      // Étape 3: Génération du CSS
      websiteGenState.updateProgress({
        current: 3,
        total: 5,
        name: 'Génération CSS',
        step: 'Application des styles'
      });

      const css = await this.generateCSS();

      // Étape 4: Génération du JavaScript
      websiteGenState.updateProgress({
        current: 4,
        total: 5,
        name: 'Génération JavaScript',
        step: 'Ajout des fonctionnalités interactives'
      });

      const js = await this.generateJS();

      // Étape 5: Finalisation
      websiteGenState.updateProgress({
        current: 5,
        total: 5,
        name: 'Finalisation',
        step: 'Assemblage final'
      });

      const metadata = this.generateMetadata();
      const assets = this.collectAssets();

      // Arrêter le processing
      websiteGenState.stopProcessing();

      return {
        html,
        css,
        js,
        metadata,
        assets
      };

    } catch (error) {
      websiteGenState.stopProcessing();
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de la génération du site: ${errorMessage}`);
    }
  }

  // ── TRAITEMENT DES IMAGES ──
  private async processImages(): Promise<void> {
    const images: ProcessedImage[] = [];

    // Ajouter le logo si disponible
    if (this.leadData.logoUrl) {
      images.push({
        url: this.leadData.logoUrl,
        type: 'logo',
        isReal: true
      });
    }

    // Ajouter les images du prospect
    if (this.leadData.images && this.leadData.images.length > 0) {
      this.leadData.images.forEach(imageUrl => {
        images.push({
          url: imageUrl,
          type: this.detectImageType(imageUrl),
          isReal: true
        });
      });
    }

    // Compléter avec des images Pexels si nécessaire
    const sectorImages = await this.getSectorImages();
    sectorImages.forEach(imageUrl => {
      if (images.length < 10) { // Limiter le nombre d'images
        images.push({
          url: imageUrl,
          type: this.detectImageType(imageUrl),
          isReal: false
        });
      }
    });

    this.processedImages = images;
  }

  private async getSectorImages(): Promise<string[]> {
    try {
      // Essayer d'abord les images spécifiques au secteur
      const sectorImages = getSectorImages(this.leadData.sector);
      if (sectorImages.length > 0) {
        return sectorImages.slice(0, 5);
      }

      // Sinon, utiliser l'API Pexels
      const pexelsImages = await getImagesForLead(this.leadData);
      return pexelsImages.slice(0, 5);
    } catch (error) {
      console.warn('Erreur lors de la récupération des images:', error);
      return [];
    }
  }

  private detectImageType(url: string): 'logo' | 'photo' | 'icon' | 'banner' | 'unknown' {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('logo')) return 'logo';
    if (lowerUrl.includes('icon')) return 'icon';
    if (lowerUrl.includes('banner')) return 'banner';
    if (lowerUrl.includes('avatar') || lowerUrl.includes('profile')) return 'logo';
    
    return 'photo'; // Par défaut, considérer comme photo
  }

  // ── GÉNÉRATION HTML ──
  private async generateHTML(): Promise<string> {
    switch (this.options.template) {
      case 'ultimate':
        return await generateUltimateSiteAsync(this.leadData);
      case 'modern':
        return await this.generateModernHTML();
      case 'sector':
        return await this.generateSectorHTML();
      default:
        return await generateUltimateSiteAsync(this.leadData);
    }
  }

  private async generateModernHTML(): Promise<string> {
    // Implémentation du template moderne
    return `<!DOCTYPE html>
<html lang="${this.options.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.leadData.companyName} - ${this.leadData.sector}</title>
    <meta name="description" content="${this.leadData.description || `Services ${this.leadData.sector} à ${this.leadData.city}`}">
</head>
<body>
    <div class="website-container">
        <!-- Header -->
        <header class="header">
            <div class="container">
                <div class="logo">
                    ${this.leadData.logoUrl ? `<img src="${this.leadData.logoUrl}" alt="${this.leadData.companyName}">` : `<h1>${this.leadData.companyName}</h1>`}
                </div>
                <nav class="navigation">
                    <ul>
                        <li><a href="#accueil">Accueil</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </header>

        <!-- Hero Section -->
        <section class="hero" id="accueil">
            <div class="container">
                <div class="hero-content">
                    <h2>${this.leadData.companyName}</h2>
                    <p>${this.leadData.description || `Expert en ${this.leadData.sector} à ${this.leadData.city}`}</p>
                    <button class="cta-button">Nous contacter</button>
                </div>
                <div class="hero-image">
                    ${this.getHeroImage()}
                </div>
            </div>
        </section>

        <!-- Services -->
        <section class="services" id="services">
            <div class="container">
                <h3>Nos Services</h3>
                <div class="services-grid">
                    ${this.generateServiceCards()}
                </div>
            </div>
        </section>

        <!-- Contact -->
        <section class="contact" id="contact">
            <div class="container">
                <h3>Contactez-nous</h3>
                <div class="contact-info">
                    <p><strong>Email:</strong> ${this.leadData.email}</p>
                    <p><strong>Téléphone:</strong> ${this.leadData.phone}</p>
                    <p><strong>Ville:</strong> ${this.leadData.city}</p>
                </div>
                <button class="contact-button">Envoyer un message</button>
            </div>
        </section>
    </div>
</body>
</html>`;
  }

  private async generateSectorHTML(): Promise<string> {
    // Implémentation spécifique au secteur
    return this.generateModernHTML(); // Pour l'instant, utiliser le template moderne
  }

  private getHeroImage(): string {
    const heroImages = this.processedImages.filter(img => img.type === 'photo');
    if (heroImages.length > 0) {
      return `<img src="${heroImages[0].url}" alt="${this.leadData.companyName}">`;
    }
    return `<div class="placeholder-image"></div>`;
  }

  private generateServiceCards(): string {
    const services = this.getSectorServices();
    return services.map(service => `
      <div class="service-card">
        <h4>${service.name}</h4>
        <p>${service.description}</p>
      </div>
    `).join('');
  }

  private getSectorServices(): Array<{name: string, description: string}> {
    // Services par défaut selon le secteur
    const sectorServices: Record<string, Array<{name: string, description: string}>> = {
      'restaurant': [
        { name: 'Cuisine Traditionnelle', description: 'Plats authentiques préparés avec passion' },
        { name: 'Service Traiteur', description: 'Pour vos événements privés et professionnels' },
        { name: 'Livraison à Domicile', description: 'Profitez de nos spécialités chez vous' }
      ],
      'garage': [
        { name: 'Entretien Mécanique', description: 'Révision et maintenance complète' },
        { name: 'Carrosserie', description: 'Réparation et peinture' },
        { name: 'Diagnostic Électronique', description: 'Détection et résolution de pannes' }
      ],
      'default': [
        { name: 'Service Principal', description: 'Notre expertise de pointe' },
        { name: 'Consultation', description: 'Conseils personnalisés' },
        { name: 'Support Client', description: 'Accompagnement continu' }
      ]
    };

    return sectorServices[this.leadData.sector?.toLowerCase()] || sectorServices['default'];
  }

  // ── GÉNÉRATION CSS ──
  private async generateCSS(): Promise<string> {
    return `
/* Styles LeadForge AI - Website Generator */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --accent-color: #f59e0b;
  --text-dark: #1e293b;
  --text-light: #64748b;
  --background: #ffffff;
  --background-light: #f8fafc;
  --border-color: #e2e8f0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: var(--text-dark);
  background: var(--background);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: var(--background);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo img {
  height: 40px;
  width: auto;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.navigation ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.navigation a {
  text-decoration: none;
  color: var(--text-dark);
  font-weight: 500;
  transition: color 0.3s ease;
}

.navigation a:hover {
  color: var(--primary-color);
}

/* Hero Section */
.hero {
  margin-top: 80px;
  padding: 4rem 0;
  background: linear-gradient(135deg, var(--background-light) 0%, var(--background) 100%);
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.hero-content p {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.cta-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.placeholder-image {
  width: 100%;
  height: 400px;
  background: var(--background-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
}

/* Services Section */
.services {
  padding: 4rem 0;
  background: var(--background);
}

.services h3 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--text-dark);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background: var(--background-light);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.service-card h4 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.service-card p {
  color: var(--text-light);
}

/* Contact Section */
.contact {
  padding: 4rem 0;
  background: var(--background-light);
}

.contact h3 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--text-dark);
}

.contact-info {
  text-align: center;
  margin-bottom: 2rem;
}

.contact-info p {
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.contact-button {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: block;
  margin: 0 auto;
}

.contact-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero .container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-content h2 {
    font-size: 2rem;
  }
  
  .navigation ul {
    flex-direction: column;
    gap: 1rem;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
}
`;
  }

  // ── GÉNÉRATION JAVASCRIPT ──
  private async generateJS(): Promise<string> {
    return `
// LeadForge AI - Website Generator JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling pour la navigation
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Gestion du bouton CTA
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      const contactSection = document.querySelector('#contact');
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Gestion du bouton de contact
  const contactButton = document.querySelector('.contact-button');
  if (contactButton) {
    contactButton.addEventListener('click', function() {
      // Ouvrir le client email par défaut
      const email = '${this.leadData.email}';
      const subject = encodeURIComponent('Demande de contact - ${this.leadData.companyName}');
      const body = encodeURIComponent('Bonjour,\\n\\nJe vous contacte concernant vos services.\\n\\nCordialement,');
      window.location.href = \`mailto:\${email}?subject=\${subject}&body=\${body}\`;
    });
  }

  // Animation au scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observer les cartes de services
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Header scroll effect
  let lastScroll = 0;
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.backdropFilter = 'blur(10px)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'var(--background)';
      header.style.backdropFilter = 'none';
      header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });

  console.log('LeadForge AI Website Generator - Site web chargé avec succès');
});
`;
  }

  // ── MÉTADONNÉES ──
  private generateMetadata(): GeneratedWebsite['metadata'] {
    const title = `${this.leadData.companyName} - ${this.leadData.sector} à ${this.leadData.city}`;
    const description = this.leadData.description || `Services professionnels ${this.leadData.sector} à ${this.leadData.city}`;
    
    return {
      title,
      description,
      keywords: [
        this.leadData.companyName,
        this.leadData.sector,
        this.leadData.city,
        'services',
        'professionnel'
      ],
      favicon: this.leadData.logoUrl,
      openGraph: {
        'og:title': title,
        'og:description': description,
        'og:type': 'website',
        'og:locale': this.options.language === 'fr' ? 'fr_FR' : 'en_US',
        'og:site_name': this.leadData.companyName
      }
    };
  }

  // ── COLLECTE DES ASSETS ──
  private collectAssets(): GeneratedWebsite['assets'] {
    return {
      images: this.processedImages.map(img => img.url),
      fonts: [
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      ],
      scripts: []
    };
  }
}

// ── FONCTIONS UTILITAIRES ──

interface ProcessedImage {
  url: string;
  type: 'logo' | 'photo' | 'icon' | 'banner' | 'unknown';
  width?: number;
  height?: number;
  aspectRatio?: number;
  isReal: boolean;
}

// Fonction export pour utilisation facile
export async function generateWebsiteForLead(
  leadData: LeadData, 
  options?: WebsiteGenerationOptions
): Promise<GeneratedWebsite> {
  const generator = new WebsiteGenerator(leadData, options);
  return await generator.generateWebsite();
}

// Fonction pour générer un site rapidement (version simplifiée)
export async function generateQuickWebsite(leadData: LeadData): Promise<string> {
  const generator = new WebsiteGenerator(leadData, { template: 'ultimate' });
  const website = await generator.generateWebsite();
  return website.html;
}

export default WebsiteGenerator;
