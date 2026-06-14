// ── TEMPLATE MODERNE INSPIRÉ DE L'EXEMPLE ──
// Design épuré, minimaliste et professionnel

export interface ModernContent {
  companyName: string;
  sector: string;
  city: string;
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  services: Array<{ name: string; description: string }>;
  testimonials: Array<{ author: string; text: string; rating: number }>;
}

const SECTOR_MODERN_TEMPLATES = {
  plomberie: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#2563eb',
    services: [
      'Dépannage urgence',
      'Installation sanitaire', 
      'Chauffage',
      'Plomberie générale',
      'Diagnostic fuites',
      'Rénovation'
    ]
  },
  electricien: {
    primary: '#000000',
    secondary: '#ffffff', 
    accent: '#dc2626',
    services: [
      'Mise aux normes',
      'Tableau électrique',
      'Éclairage',
      'Domotique',
      'Dépannage',
      'Diagnostic'
    ]
  },
  coiffeur: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#7c3aed',
    services: [
      'Coupe femme',
      'Coupe homme',
      'Coloration',
      'Balayage',
      'Soin capillaire',
      'Extension'
    ]
  },
  restaurant: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#ea580c',
    services: [
      'Plats traditionnels',
      'Menu dégustation',
      'Service traiteur',
      'Vins sélectionnés',
      'Brunch',
      'Événements'
    ]
  },
  garage: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#16a34a',
    services: [
      'Diagnostic moteur',
      'Révision complète',
      'Pneumatique',
      'Carrosserie',
      'Vidange',
      'Contrôle technique'
    ]
  },
  default: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#6b7280',
    services: [
      'Consultation',
      'Service personnalisé',
      'Intervention rapide',
      'Devis gratuit',
      'Garantie satisfaction',
      'Support client'
    ]
  }
};

function getModernTemplate(sector: string) {
  const normalizedSector = (sector || '').toLowerCase();
  
  for (const [key, template] of Object.entries(SECTOR_MODERN_TEMPLATES)) {
    if (normalizedSector.includes(key)) {
      return template;
    }
  }
  
  return SECTOR_MODERN_TEMPLATES.default;
}

export function generateModernSite(lead: any): string {
  const template = getModernTemplate(lead.sector);
  const companyName = lead.name || 'Entreprise';
  const city = lead.city || '';
  const phone = lead.phone || '';
  const email = lead.email || '';
  const address = lead.address || '';
  const description = lead.description || `Professionnel ${lead.sector || 'qualifié'}${city ? ' à ' + city : ''}`;
  
  // Services personnalisés
  const services = template.services.map((serviceName) => ({
    name: serviceName,
    description: `Solution professionnelle ${serviceName.toLowerCase()} adaptée à vos besoins.`
  }));

  // Témoignages
  const testimonials = (lead.googleReviewsData || []).slice(0, 3).map((review: any) => ({
    author: review.author || 'Client satisfait',
    text: review.text || 'Excellent service, je recommande vivement !',
    rating: review.rating || 5
  }));

  const content: ModernContent = {
    companyName,
    sector: lead.sector || 'Professionnel',
    city,
    heroTitle: companyName,
    heroSubtitle: description,
    description,
    phone,
    email,
    address,
    services,
    testimonials
  };

  return buildModernHTML(content, template);
}

function buildModernHTML(content: ModernContent, template: any): string {
  const { companyName, heroTitle, heroSubtitle, description, services, testimonials } = content;
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyName} - ${content.sector}${content.city ? ' à ' + content.city : ''}</title>
    <meta name="description" content="${heroSubtitle.substring(0, 160)}">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #000000;
            background: #ffffff;
            overflow-x: hidden;
        }
        
        /* Navigation */
        .nav-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .nav-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 600;
            color: #000000;
            text-decoration: none;
            letter-spacing: -0.02em;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
            margin: 0;
            padding: 0;
        }
        
        .nav-link {
            color: #000000;
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: opacity 0.2s ease;
        }
        
        .nav-link:hover {
            opacity: 0.7;
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8rem 2rem 4rem;
            text-align: center;
            background: #ffffff;
        }
        
        .hero-content {
            max-width: 800px;
        }
        
        .hero h1 {
            font-size: clamp(3rem, 8vw, 6rem);
            font-weight: 700;
            line-height: 0.9;
            margin-bottom: 2rem;
            letter-spacing: -0.03em;
            color: #000000;
        }
        
        .hero p {
            font-size: 1.25rem;
            font-weight: 400;
            line-height: 1.5;
            margin-bottom: 3rem;
            color: #000000;
            opacity: 0.8;
        }
        
        .cta-button {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: ${template.accent};
            color: #ffffff;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            border-radius: 8px;
            transition: all 0.2s ease;
            letter-spacing: 0.01em;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* Services Section */
        .services {
            padding: 6rem 2rem;
            background: #ffffff;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .services-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .services-header {
            text-align: center;
            margin-bottom: 4rem;
        }
        
        .services-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }
        
        .services-header p {
            font-size: 1.1rem;
            color: #000000;
            opacity: 0.7;
        }
        
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }
        
        .service-card {
            padding: 2rem;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 12px;
            transition: all 0.3s ease;
        }
        
        .service-card:hover {
            border-color: ${template.accent};
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        
        .service-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            letter-spacing: -0.01em;
        }
        
        .service-card p {
            color: #000000;
            opacity: 0.7;
            line-height: 1.6;
        }
        
        /* About Section */
        .about {
            padding: 6rem 2rem;
            background: #fafafa;
        }
        
        .about-container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        
        .about h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 2rem;
            letter-spacing: -0.02em;
        }
        
        .about p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #000000;
            opacity: 0.8;
        }
        
        /* Testimonials Section */
        ${testimonials.length > 0 ? `
        .testimonials {
            padding: 6rem 2rem;
            background: #ffffff;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .testimonials-container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .testimonials h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 3rem;
            text-align: center;
            letter-spacing: -0.02em;
        }
        
        .testimonial {
            padding: 2rem;
            background: #fafafa;
            border-radius: 12px;
            margin-bottom: 2rem;
        }
        
        .testimonial-text {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
            font-style: italic;
        }
        
        .testimonial-author {
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .testimonial-rating {
            color: #fbbf24;
        }
        ` : ''}
        
        /* Contact Section */
        .contact {
            padding: 6rem 2rem;
            background: #000000;
            color: #ffffff;
            text-align: center;
        }
        
        .contact-container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .contact h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 2rem;
            letter-spacing: -0.02em;
        }
        
        .contact-info {
            margin-bottom: 3rem;
        }
        
        .contact-item {
            margin-bottom: 1.5rem;
            font-size: 1.1rem;
        }
        
        .contact-cta {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: #ffffff;
            color: #000000;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        
        .contact-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
        }
        
        /* Footer */
        .footer {
            padding: 3rem 2rem;
            background: #ffffff;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            text-align: center;
        }
        
        .footer p {
            color: #000000;
            opacity: 0.6;
            font-size: 0.9rem;
        }
        
        /* Mobile Menu */
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
        }
        
        .mobile-menu-toggle span {
            display: block;
            width: 25px;
            height: 2px;
            background: #000000;
            margin: 5px 0;
            transition: all 0.3s ease;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .nav-content {
                padding: 1rem 1.5rem;
            }
            
            .nav-links {
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                flex-direction: column;
                padding: 2rem;
                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }
            
            .nav-links.active {
                display: flex;
            }
            
            .mobile-menu-toggle {
                display: block;
            }
            
            .hero {
                padding: 6rem 1.5rem 3rem;
            }
            
            .hero h1 {
                font-size: clamp(2.5rem, 6vw, 4rem);
            }
            
            .services, .about, .contact, .testimonials {
                padding: 4rem 1.5rem;
            }
            
            .services-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .service-card {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav-container">
        <div class="nav-content">
            <a href="#home" class="logo">${companyName}</a>
            <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links" id="navLinks">
                <li><a href="#home" class="nav-link">Accueil</a></li>
                <li><a href="#services" class="nav-link">Services</a></li>
                <li><a href="#about" class="nav-link">À propos</a></li>
                <li><a href="#testimonials" class="nav-link">Avis</a></li>
                <li><a href="#contact" class="nav-link">Contact</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="hero-content">
            <h1>${heroTitle}</h1>
            <p>${heroSubtitle}</p>
            <a href="#contact" class="cta-button">Nous contacter</a>
        </div>
    </section>

    <!-- Services Section -->
    <section class="services" id="services">
        <div class="services-container">
            <div class="services-header">
                <h2>Services</h2>
                <p>Nous proposons des solutions professionnelles adaptées à vos besoins</p>
            </div>
            <div class="services-grid">
                ${services.map(service => `
                <div class="service-card">
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
        <div class="about-container">
            <h2>À propos</h2>
            <p>${description}. Nous sommes passionnés par notre métier et nous nous engageons à fournir un service d'excellence à chaque client. Notre expertise et notre savoir-faire garantissent des résultats durables et satisfaisants.</p>
        </div>
    </section>

    ${testimonials.length > 0 ? `
    <!-- Testimonials Section -->
    <section class="testimonials" id="testimonials">
        <div class="testimonials-container">
            <h2>Avis clients</h2>
            ${testimonials.map(testimonial => `
            <div class="testimonial">
                <div class="testimonial-text">"${testimonial.text}"</div>
                <div class="testimonial-author">${testimonial.author}</div>
                <div class="testimonial-rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
            </div>
            `).join('')}
        </div>
    </section>
    ` : ''}

    <!-- Contact Section -->
    <section class="contact" id="contact">
        <div class="contact-container">
            <h2>Contact</h2>
            <div class="contact-info">
                ${content.phone ? `<div class="contact-item">📞 ${content.phone}</div>` : ''}
                ${content.email ? `<div class="contact-item">✉️ ${content.email}</div>` : ''}
                ${content.address ? `<div class="contact-item">📍 ${content.address}</div>` : ''}
            </div>
            ${content.phone ? `<a href="tel:${content.phone}" class="contact-cta">Appeler maintenant</a>` : ''}
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <p>&copy; 2024 ${companyName}. Tous droits réservés.</p>
    </footer>

    <script>
        // Mobile menu toggle
        function toggleMobileMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                // Close mobile menu if open
                document.getElementById('navLinks').classList.remove('active');
            });
        });

        // Navbar scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.nav-container');
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.backdropFilter = 'blur(25px)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
            
            lastScroll = currentScroll;
        });

        // Animation on scroll
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

        // Observe elements for animation
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.service-card, .testimonial').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        });
    </script>
</body>
</html>`;
}
