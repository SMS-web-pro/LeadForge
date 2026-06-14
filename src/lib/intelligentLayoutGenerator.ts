// Système intelligent de génération de layouts avec IA
// Analyse automatique du secteur et des données enrichies pour créer des layouts uniques
// Utilise le système LLM existant avec fallback automatique

import { callLLMForWebsite, ApiConfig } from './supabase-store';

// Interfaces manquantes pour TypeScript
interface SectionComponent {
  type: string;
  content: string;
  dataBinding: string;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface Typography {
  headings: string;
  body: string;
  accent: string;
}

// Interface pour les données enrichies complètes
interface EnrichedLeadData {
  sector: string;
  companyName: string;
  city: string;
  description?: string;
  services?: string[];
  specialties?: string[];
  certifications?: string[];
  experience?: string;
  portfolio?: string[];
  pricing?: string;
  customFields?: Record<string, any>;
  businessSize?: string; // 'solo', 'small', 'medium', 'large'
  targetAudience?: string;
  uniqueFeatures?: string[];
  competitiveAdvantages?: string[];
  businessModel?: string;
}

// Layout généré par l'IA
interface GeneratedLayout {
  sections: LayoutSection[];
  features: LayoutFeatures;
  styling: LayoutStyling;
  interactions: LayoutInteractions;
}

interface LayoutSection {
  id: string;
  type: 'hero' | 'gallery' | 'services' | 'testimonials' | 'contact' | 'booking' | 'pricing' | 'team' | 'portfolio' | 'certifications' | 'custom';
  title: string;
  description: string;
  components: SectionComponent[];
  priority: number;
  customContent?: any;
}

interface LayoutFeatures {
  gallery: boolean;
  booking: boolean;
  pricing: boolean;
  team: boolean;
  testimonials: boolean;
  emergency: boolean;
  certifications: boolean;
  portfolio: boolean;
  custom: string[];
}

interface LayoutStyling {
  colorScheme: ColorScheme;
  typography: Typography;
  layout: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
  animations: boolean;
  interactive: boolean;
}

interface LayoutInteractions {
  forms: string[];
  buttons: string[];
  navigation: string[];
  specialFeatures: string[];
}

export class IntelligentLayoutGenerator {
  private config: ApiConfig;

  constructor(config?: ApiConfig) {
    // Utiliser la configuration existante ou une configuration par défaut
    this.config = config || {
      groqKey: process.env.GROQ_API_KEY || '',
      geminiKey: process.env.GEMINI_API_KEY || '',
      nvidiaKey: process.env.NVIDIA_API_KEY || '',
      openrouterKey: process.env.OPENROUTER_API_KEY || '',
      defaultLlm: 'groq',
      serperKey: process.env.SERPER_API_KEY || '',
      unsplashKey: process.env.UNSPLASH_API_KEY || '',
      pexelsKey: process.env.PEXELS_API_KEY || '',
      gmailSmtpUser: process.env.GMAIL_SMTP_EMAIL || '',
      gmailSmtpFromEmail: process.env.GMAIL_SMTP_EMAIL || '',
      gmailSmtpFromName: process.env.GMAIL_SMTP_NAME || '',
      gmailSmtpPassword: process.env.GMAIL_SMTP_PASSWORD || '',
      gmailSmtpHost: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
      gmailSmtpPort: Number(process.env.GMAIL_SMTP_PORT) || 587,
      gmailSmtpSecure: true,
      whopDepositLink: '',
      whopFinalPaymentLink: ''
    };
  }

  // Fonction principale - génère un layout intelligent
  async generateIntelligentLayout(leadData: EnrichedLeadData): Promise<GeneratedLayout> {
    // 1. Analyse intelligente du secteur et des données
    const sectorAnalysis = await this.analyzeSectorAndBusiness(leadData);
    
    // 2. Génération du layout avec IA
    const layoutPrompt = this.buildLayoutPrompt(leadData, sectorAnalysis);
    const aiResponse = await this.callAI(layoutPrompt);
    
    // 3. Parsing et structuration du layout
    const layout = this.parseLayoutResponse(aiResponse, leadData);
    
    // 4. Optimisation et finalisation
    return this.optimizeLayout(layout, leadData);
  }

  // Analyse intelligente du secteur et business
  private async analyzeSectorAndBusiness(data: EnrichedLeadData): Promise<string> {
    const analysisPrompt = `
    Analyse ce business et génère une description détaillée :

    Secteur: ${data.sector}
    Entreprise: ${data.companyName}
    Ville: ${data.city}
    Description: ${data.description || 'Non fournie'}
    Services: ${data.services?.join(', ') || 'Non fournis'}
    Spécialités: ${data.specialties?.join(', ') || 'Non fournies'}
    Taille: ${data.businessSize || 'Non spécifiée'}
    Public cible: ${data.targetAudience || 'Non spécifié'}

    Génère une analyse structurée (JSON) avec:
    - businessType: type exact du business
    - primaryServices: services principaux (max 5)
    - uniqueValue: ce qui rend ce business unique
    - customerNeeds: besoins des clients
    - conversionGoals: objectifs de conversion
    - requiredFeatures: fonctionnalités indispensables
    - recommendedSections: sections recommandées
    - visualStyle: style visuel recommandé
    `;

    try {
      const response = await callLLMForWebsite(this.config, analysisPrompt, 
        "Tu es un expert en analyse business. Génère une analyse structurée et précise.");
      return response;
    } catch (error) {
      console.error('Erreur analyse secteur:', error);
      // Fallback si le LLM échoue
      return JSON.stringify({
        businessType: data.sector,
        primaryServices: data.services?.slice(0, 5) || [],
        uniqueValue: "Service professionnel de qualité",
        customerNeeds: "Solutions fiables et rapides",
        conversionGoals: "Générer des contacts et devis",
        requiredFeatures: ["contact", "services"],
        recommendedSections: ["hero", "services", "contact"],
        visualStyle: "modern"
      });
    }
  }

  // Construction du prompt pour générer le layout
  private buildLayoutPrompt(data: EnrichedLeadData, analysis: string): string {
    return `
    En tant qu'expert en design web et UX, génère un layout HTML personnalisé pour ce business :

    DONNÉES DU BUSINESS:
    ${JSON.stringify(data, null, 2)}

    ANALYSE SECTORIELLE:
    ${analysis}

    CONSIGNES:
    1. Génère un layout UNIQUE qui reflète parfaitement ce business
    2. Adapte les sections selon les besoins spécifiques du secteur
    3. Intègre intelligemment les données enrichies disponibles
    4. Crée une expérience utilisateur optimisée pour la conversion
    5. Utilise des fonctionnalités modernes et interactives

    FORMAT DE RÉPONSE (JSON):
    {
      "sections": [
        {
          "id": "unique-section-id",
          "type": "hero|gallery|services|testimonials|contact|booking|pricing|team|portfolio|certifications|custom",
          "title": "Titre de la section",
          "description": "Description de la section",
          "components": [
            {
              "type": "component-type",
              "content": "contenu spécifique",
              "dataBinding": "champ-donnée-à-utiliser"
            }
          ],
          "priority": 1-10,
          "customContent": {}
        }
      ],
      "features": {
        "gallery": boolean,
        "booking": boolean,
        "pricing": boolean,
        "team": boolean,
        "testimonials": boolean,
        "emergency": boolean,
        "certifications": boolean,
        "portfolio": boolean,
        "custom": ["feature1", "feature2"]
      },
      "styling": {
        "colorScheme": {
          "primary": "#hex",
          "secondary": "#hex",
          "accent": "#hex",
          "background": "#hex"
        },
        "typography": {
          "headings": "police-titres",
          "body": "police-texte",
          "accent": "police-accent"
        },
        "layout": "modern|classic|minimal|bold|elegant",
        "animations": boolean,
        "interactive": boolean
      },
      "interactions": {
        "forms": ["form1", "form2"],
        "buttons": ["btn1", "btn2"],
        "navigation": ["nav1", "nav2"],
        "specialFeatures": ["feature1", "feature2"]
      }
    }

    Sois créatif et spécifique à ce business. Évite les layouts génériques.
    `;
  }

  // Appel à l'IA pour générer le layout
  private async callAI(prompt: string): Promise<string> {
    try {
      const response = await callLLMForWebsite(this.config, prompt, 
        "Tu es un expert en design web et UX. Génère des layouts HTML personnalisés et professionnels.");
      return response;
    } catch (error) {
      console.error('Erreur génération layout IA:', error);
      // Fallback si le LLM échoue
      return JSON.stringify({
        sections: this.getDefaultSections('default'),
        features: this.getDefaultFeatures('default'),
        styling: this.getDefaultStyling('default'),
        interactions: this.getDefaultInteractions('default')
      });
    }
  }

  // Parsing de la réponse IA
  private parseLayoutResponse(aiResponse: string, data: EnrichedLeadData): GeneratedLayout {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Pas de JSON trouvé dans la réponse IA');
      }

      const layoutData = JSON.parse(jsonMatch[0]);
      
      // Valider et compléter le layout
      return {
        sections: layoutData.sections || this.getDefaultSections(data.sector),
        features: layoutData.features || this.getDefaultFeatures(data.sector),
        styling: layoutData.styling || this.getDefaultStyling(data.sector),
        interactions: layoutData.interactions || this.getDefaultInteractions(data.sector)
      };
    } catch (error) {
      console.error('Erreur parsing IA response:', error);
      // Fallback vers layout par défaut
      return this.getFallbackLayout(data.sector);
    }
  }

  // Optimisation du layout
  private optimizeLayout(layout: GeneratedLayout, data: EnrichedLeadData): GeneratedLayout {
    // Optimiser selon les données disponibles
    const optimizedSections = layout.sections.map(section => {
      // Adapter le contenu selon les données enrichies
      if (section.type === 'services' && data.services) {
        section.components = data.services.map((service, index) => ({
          type: 'service-card',
          content: service,
          dataBinding: `services[${index}]`
        }));
      }

      if (section.type === 'gallery' && data.portfolio) {
        section.components = data.portfolio.map((image, index) => ({
          type: 'gallery-item',
          content: image,
          dataBinding: `portfolio[${index}]`
        }));
      }

      return section;
    });

    // Optimiser les couleurs selon le secteur
    const optimizedColors = this.optimizeColorScheme(layout.styling.colorScheme, data.sector);

    return {
      ...layout,
      sections: optimizedSections,
      styling: {
        ...layout.styling,
        colorScheme: optimizedColors
      }
    };
  }

  // Génération HTML finale
  async generateHTML(leadData: EnrichedLeadData): Promise<string> {
    const layout = await this.generateIntelligentLayout(leadData);
    
    return this.buildHTMLFromLayout(layout, leadData);
  }

  // Construction HTML depuis le layout
  private buildHTMLFromLayout(layout: GeneratedLayout, data: EnrichedLeadData): string {
    let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.companyName} - ${data.sector} à ${data.city}</title>
        
        <!-- Styles dynamiques -->
        <style>
            :root {
                --primary: ${layout.styling.colorScheme.primary};
                --secondary: ${layout.styling.colorScheme.secondary};
                --accent: ${layout.styling.colorScheme.accent};
                --background: ${layout.styling.colorScheme.background};
            }
            
            /* Typography */
            body {
                font-family: ${layout.styling.typography.body}, sans-serif;
                background: var(--background);
                color: #333;
            }
            
            h1, h2, h3 {
                font-family: ${layout.styling.typography.headings}, sans-serif;
                color: var(--primary);
            }
            
            /* Layout specific styles */
            .layout-${layout.styling.layout} {
                /* Styles selon le layout */
            }
        </style>
        
        <!-- Scripts pour interactions -->
        ${layout.interactions.specialFeatures.includes('animations') ? '<script src="animations.js"></script>' : ''}
    </head>
    <body class="layout-${layout.styling.layout}">
    `;

    // Générer chaque section
    layout.sections
      .sort((a, b) => b.priority - a.priority)
      .forEach(section => {
        html += this.generateSectionHTML(section, data, layout);
      });

    html += `
    </body>
    </html>`;

    return html;
  }

  // Génération HTML d'une section
  private generateSectionHTML(section: LayoutSection, data: EnrichedLeadData, layout: GeneratedLayout): string {
    switch (section.type) {
      case 'hero':
        return `
        <section class="hero-section" id="${section.id}">
            <div class="hero-content">
                <h1>${data.companyName}</h1>
                <p>${section.description}</p>
                ${layout.features.booking ? '<button class="cta-primary">Réserver maintenant</button>' : ''}
                ${layout.features.emergency ? '<a href="tel:${data.phone}" class="emergency-btn">Urgence 24/7</a>' : ''}
            </div>
            ${data.portfolio && data.portfolio.length > 0 ? 
              `<div class="hero-image">
                <img src="${data.portfolio[0]}" alt="${data.companyName}" />
              </div>` : ''}
        </section>`;

      case 'gallery':
        return `
        <section class="gallery-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="gallery-grid">
                ${(data.portfolio || []).map((image, index) => `
                    <div class="gallery-item">
                        <img src="${image}" alt="Gallery ${index + 1}" />
                    </div>
                `).join('')}
            </div>
        </section>`;

      case 'services':
        return `
        <section class="services-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="services-grid">
                ${(data.services || []).map((service, index) => `
                    <div class="service-card">
                        <h3>${service}</h3>
                        <p>Description du service ${index + 1}</p>
                        ${layout.features.pricing ? '<span class="price">Sur devis</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </section>`;

      case 'booking':
        return `
        <section class="booking-section" id="${section.id}">
            <h2>${section.title}</h2>
            <form class="booking-form">
                <input type="text" placeholder="Votre nom" required>
                <input type="email" placeholder="Votre email" required>
                <input type="tel" placeholder="Votre téléphone" required>
                <textarea placeholder="Votre message" rows="4"></textarea>
                <button type="submit" class="submit-btn">Envoyer</button>
            </form>
        </section>`;

      case 'testimonials':
        return `
        <section class="testimonials-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="testimonials-grid">
                <div class="testimonial">
                    <p>"Excellent service, très professionnel !"</p>
                    <cite>- Client satisfait</cite>
                </div>
                <div class="testimonial">
                    <p>"Je recommande vivement, travail de qualité."</p>
                    <cite>- Client régulier</cite>
                </div>
            </div>
        </section>`;

      default:
        return `
        <section class="${section.type}-section" id="${section.id}">
            <h2>${section.title}</h2>
            <p>${section.description}</p>
        </section>`;
    }
  }

  // Fonctions utilitaires
  private getDefaultSections(sector: string): LayoutSection[] {
    return [
      {
        id: 'hero',
        type: 'hero',
        title: `${sector.charAt(0).toUpperCase() + sector.slice(1)} professionnel`,
        description: `Services de qualité à votre disposition`,
        components: [],
        priority: 10
      },
      {
        id: 'services',
        type: 'services',
        title: 'Nos services',
        description: 'Découvrez nos prestations',
        components: [],
        priority: 8
      },
      {
        id: 'contact',
        type: 'contact',
        title: 'Contact',
        description: 'Contactez-nous',
        components: [],
        priority: 5
      }
    ];
  }

  private getDefaultFeatures(sector: string): LayoutFeatures {
    return {
      gallery: ['coiffeur', 'restaurant', 'fitness'].includes(sector),
      booking: ['coiffeur', 'fitness', 'medical'].includes(sector),
      pricing: ['coiffeur', 'fitness', 'nettoyage'].includes(sector),
      team: ['medical', 'fitness', 'restaurant'].includes(sector),
      testimonials: true,
      emergency: ['plomberie', 'electricien', 'garage'].includes(sector),
      certifications: ['plomberie', 'electricien', 'medical', 'avocat'].includes(sector),
      portfolio: ['coiffeur', 'jardin', 'garage'].includes(sector),
      custom: []
    };
  }

  private getDefaultStyling(sector: string): LayoutStyling {
    const colorSchemes = {
      coiffeur: { primary: '#ec4899', secondary: '#be185d', accent: '#f472b6', background: '#fdf2f8' },
      plombier: { primary: '#0f766e', secondary: '#115e59', accent: '#14b8a6', background: '#f0fdfa' },
      restaurant: { primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', background: '#fef2f2' },
      // ... autres secteurs
    };

    return {
      colorScheme: colorSchemes[sector as keyof typeof colorSchemes] || {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#3b82f6',
        background: '#f8fafc'
      },
      typography: {
        headings: 'Inter',
        body: 'Inter',
        accent: 'Inter'
      },
      layout: 'modern',
      animations: true,
      interactive: true
    };
  }

  private getDefaultInteractions(sector: string): LayoutInteractions {
    return {
      forms: ['contact'],
      buttons: ['cta-primary'],
      navigation: ['main-nav'],
      specialFeatures: ['smooth-scroll']
    };
  }

  private getFallbackLayout(sector: string): GeneratedLayout {
    return {
      sections: this.getDefaultSections(sector),
      features: this.getDefaultFeatures(sector),
      styling: this.getDefaultStyling(sector),
      interactions: this.getDefaultInteractions(sector)
    };
  }

  private optimizeColorScheme(scheme: any, sector: string) {
    // Optimisation intelligente des couleurs selon le secteur
    return scheme;
  }
}

// Export pour utilisation
export const intelligentLayoutGenerator = new IntelligentLayoutGenerator();
