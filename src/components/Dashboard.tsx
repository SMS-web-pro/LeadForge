import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from '@e965/xlsx';
import { v4 as uuidv4 } from 'uuid';
import { configService } from '../lib/supabase';
import { Lead, mapColumns, exportLeadsCSV, useCampaigns } from '../lib/supabase-store';
import { eventBus, LeadForgeEvents } from '../lib/events';

// CSS pour l'animation shimmer
const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Injecter le CSS dans le head
if (typeof document !== 'undefined' && !document.querySelector('#shimmer-style')) {
  const style = document.createElement('style');
  style.id = 'shimmer-style';
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}

const C = {
  bg: '#F7F6F2', surface: '#FFFFFF', surface2: '#F2F1EC',
  border: '#E4E2DA', tx: '#1C1B18', tx2: '#5C5A53', tx3: '#9B9890',
  accent: '#D4500A', accent2: '#F0E8DF',
  green: '#1A7A4A', blue: '#1A4FA0', amber: '#B45309', red: '#C0392B',
};

const tempColors: Record<string, { bg: string; text: string; label: string }> = {
  very_hot: { bg: '#fef2f2', text: C.red, label: 'Très Chaud' },
  hot: { bg: '#fff7ed', text: C.amber, label: 'Chaud' },
  warm: { bg: '#fffbeb', text: '#92400e', label: 'Tiède' },
  cold: { bg: '#f0f4f8', text: '#64748b', label: 'Froid' },
  '': { bg: C.surface2, text: C.tx3, label: 'Non scoré' },
};

const stageLabels: Record<string, string> = {
  new: 'Nouveau', enriched: 'Enrichi', site_generated: 'Site Généré',
  email_sent: 'Email Envoyé', interested: 'Intéressé', converted: 'Converti', lost: 'Perdu',
};

const allTags = ['Sans site', 'Site obsolète', 'Prioritaire', 'Déjà contacté', 'Email'];

interface Props {
  leads: Lead[];
  addLeads: (leads: Partial<Lead>[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLeads: (ids: string[]) => void;
  loadLeads: () => void;
}

export default function Dashboard({ leads, addLeads, updateLead, deleteLeads, loadLeads }: Props) {
  const { campaigns, forceReloadCampaigns } = useCampaigns();
  const [campaignsCount, setCampaignsCount] = useState(campaigns.length); // État local pour les campagnes
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterWebsite, setFilterWebsite] = useState('');
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [panelLeadId, setPanelLeadId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<'view' | 'edit'>('view');
  const [editData, setEditData] = useState<Lead | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [importTotal, setImportTotal] = useState(0);
  const [scrapingModalOpen, setScrapingModalOpen] = useState(false);
  const [scrapingKeyword, setScrapingKeyword] = useState('');
  const [scrapingLocation, setScrapingLocation] = useState('');
  const [scrapingResults, setScrapingResults] = useState<any[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [linkScrapingModalOpen, setLinkScrapingModalOpen] = useState(false);
  const [scrapingLink, setScrapingLink] = useState('');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Forcer le rafraîchissement
  const fileRef = useRef<HTMLInputElement>(null);

  // Fonction pour gérer le survol avec délai
  const handleMouseEnter = useCallback((buttonName: string) => {
    // Annuler le timeout existant
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Afficher après un délai de 800ms
    const timeout = setTimeout(() => {
      setHoveredButton(buttonName);
    }, 800);
    setHoverTimeout(timeout);
  }, [hoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    // Créer un timeout pour la disparition
    const timeout = setTimeout(() => {
      setHoveredButton(null);
      setHoverTimeout(null);
    }, 4000); // 4000ms de délai avant disparition
    setHoverTimeout(timeout);
  }, []);

  // Fonctions simplifiées pour les icônes
  const handleIconMouseEnter = useCallback((buttonName: string) => {
    handleMouseEnter(buttonName);
  }, [handleMouseEnter]);

  const handleIconMouseLeave = useCallback(() => {
    handleMouseLeave();
  }, [handleMouseLeave]);

  // Fonction unique pour tous les survols (icônes, zones de connection, tooltips)
  const handleAnyMouseEnter = useCallback(() => {
    // Annuler le timeout existant
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  }, [hoverTimeout]);

  const handleAnyMouseLeave = useCallback(() => {
    // Créer un timeout pour la disparition
    const timeout = setTimeout(() => {
      setHoveredButton(null);
      setHoverTimeout(null);
    }, 1000); // 1000ms de délai avant disparition
    setHoverTimeout(timeout);
  }, []);

  // Écouter les événements de synchronisation
  useEffect(() => {
    const handleDataChange = () => {
      console.log('Dashboard: Événement de synchronisation reçu, rafraîchissement...');
      loadLeads(); // Recharger les données depuis Supabase
      forceReloadCampaigns(); // Recharger les campagnes
    };

    // S'abonner aux événements
    eventBus.on(LeadForgeEvents.LEADS_CHANGED, handleDataChange);
    eventBus.on(LeadForgeEvents.LEAD_ADDED, handleDataChange);
    eventBus.on(LeadForgeEvents.CAMPAIGNS_CHANGED, handleDataChange);
    eventBus.on(LeadForgeEvents.CAMPAIGN_ADDED, handleDataChange);
    eventBus.on(LeadForgeEvents.CAMPAIGN_DELETED, handleDataChange);
    eventBus.on(LeadForgeEvents.DATA_REFRESH, handleDataChange);

    // Cleanup
    return () => {
      eventBus.off(LeadForgeEvents.LEADS_CHANGED, handleDataChange);
      eventBus.off(LeadForgeEvents.LEAD_ADDED, handleDataChange);
      eventBus.off(LeadForgeEvents.CAMPAIGNS_CHANGED, handleDataChange);
      eventBus.off(LeadForgeEvents.CAMPAIGN_ADDED, handleDataChange);
      eventBus.off(LeadForgeEvents.CAMPAIGN_DELETED, handleDataChange);
      eventBus.off(LeadForgeEvents.DATA_REFRESH, handleDataChange);
      
      // Nettoyer le timeout au démontage
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [loadLeads, forceReloadCampaigns, hoverTimeout]);

  // Synchroniser l'état local des campagnes
  useEffect(() => {
    setCampaignsCount(campaigns.length);
    console.log('Dashboard: Campagnes synchronisées:', campaigns.length);
  }, [campaigns]);

  // Always get fresh lead data from leads array
  const panelLead = panelLeadId ? leads.find(l => l.id === panelLeadId) || null : null;

  // --- GOOGLE MAPS SCRAPING ---
  const openScrapingModal = () => {
    setScrapingModalOpen(true);
    setScrapingKeyword('');
    setScrapingLocation('');
    setScrapingResults([]);
  };

  const closeScrapingModal = () => {
    setScrapingModalOpen(false);
    setScrapingKeyword('');
    setScrapingLocation('');
    setScrapingResults([]);
  };

  // --- GOOGLE MAPS LINK SCRAPING ---
  const openLinkScrapingModal = () => {
    setLinkScrapingModalOpen(true);
    setScrapingLink('');
    setScrapingResults([]);
  };

  const closeLinkScrapingModal = () => {
    setLinkScrapingModalOpen(false);
    setScrapingLink('');
    setScrapingResults([]);
  };

  // Fonction pour scraper depuis un lien Google Maps
  const launchLinkScraping = async () => {
    if (!scrapingLink) {
      alert('Veuillez entrer un lien Google Maps');
      return;
    }

    // Valider que c'est un lien Google Maps
    if (!scrapingLink.includes('google.com/maps')) {
      alert('Veuillez entrer un lien Google Maps valide');
      return;
    }

    setIsScraping(true);
    setImportStatus('Préparation du scraping...');

    try {
      // Extraire le mot-clé et la localisation depuis le lien
      const url = new URL(scrapingLink);
      const searchPath = url.pathname;
      
      // Extraire les informations de recherche depuis l'URL
      const searchMatch = searchPath.match(/\/search\/([^\/]+)/);
      if (!searchMatch) {
        throw new Error('Impossible d\'extraire les termes de recherche du lien');
      }

      const searchTerms = decodeURIComponent(searchMatch[1]).replace('+', ' ');
      console.log('Termes de recherche extraits:', searchTerms);

      // Extraire le mot-clé et la localisation depuis les termes de recherche
      const searchParts = searchTerms.split(' ');
      let keyword = '';
      let location = '';
      
      // Chercher des noms de villes françaises communes dans les termes
      const frenchCities = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'le havre', 'saint-etienne', 'toulon', 'grenoble', 'dijon', 'angers', 'nimes', 'villeurbanne', 'clichy', 'nanterre', 'argenteuil', 'roubaix', 'tourcoing', 'caen', 'metz', 'aubervilliers', 'boulogne-billancourt', 'colombes', 'courbevoie', 'creteil', 'amiens', 'versailles', 'dunkerque', 'pau', 'le mans', 'la rochelle', 'mulhouse', 'avignon', 'bourg-en-bresse', 'cannes', 'saint-denis', 'brest', 'calais', 'annecy', 'limoges', 'tourcoing', 'nimes', 'besançon', 'orleans', 'clermont-ferrand', 'thionville', 'montreuil', 'rouen', 'levallois-perret'];
      
      const foundCity = searchParts.find(part => frenchCities.includes(part.toLowerCase()));
      
      if (foundCity) {
        location = foundCity;
        keyword = searchParts.filter(part => part.toLowerCase() !== foundCity.toLowerCase()).join(' ');
      } else {
        // Si aucune ville trouvée, utiliser le dernier mot comme localisation et le reste comme mot-clé
        if (searchParts.length >= 2) {
          location = searchParts[searchParts.length - 1];
          keyword = searchParts.slice(0, -1).join(' ');
        } else {
          keyword = searchTerms;
          location = 'Paris'; // Valeur par défaut
        }
      }
      
      console.log('Mot-clé extrait:', keyword);
      console.log('Localisation extraite:', location);

      // Utiliser la même fonction de scraping existante
      const results = await fetchRealGoogleMapsData(keyword, location);
      console.log('=== DIAGNOSTIC scraping par lien ===');
      console.log('results from API:', results);
      console.log('results type:', typeof results);
      console.log('Array.isArray(results):', Array.isArray(results));
      console.log('results length:', results?.length);
      
      setScrapingResults(results);
      console.log('scrapingResults après setScrapingResults:', scrapingResults);
      
      setImportStatus(`${results.length} entreprises trouvées`);
      
      // Ouvrir le modal de campagne après 2 secondes
      setTimeout(() => {
        console.log('=== DIAGNOSTIC avant ouverture modal ===');
        console.log('scrapingResults dans setTimeout:', scrapingResults);
        console.log('scrapingResults length dans setTimeout:', scrapingResults?.length);
        
        setLinkScrapingModalOpen(false);
        setCampaignName(''); // Réinitialiser le nom de campagne
        setCampaignModalOpen(true);
        setImportStatus('');
      }, 2000);

    } catch (error: unknown) {
      console.error('Erreur scraping lien:', error);
      setImportStatus('Erreur lors du scraping: ' + (error as Error).message);
    } finally {
      setIsScraping(false);
    }
  };

  const launchProfessionalScraping = async () => {
    if (!scrapingKeyword || !scrapingLocation) {
      alert('Veuillez remplir le mot-clé et l\'emplacement');
      return;
    }

    setIsScraping(true);
    setImportStatus('Initialisation du scraping...');
    setImportProgress(0);

    try {
      // Étape 1: Construction de l'URL de recherche Google Maps
      setImportStatus('Construction de la recherche Google Maps...');
      setImportProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500));

      const query = encodeURIComponent(`${scrapingKeyword} ${scrapingLocation}`);
      const searchUrl = `https://www.google.com/maps/search/${query}`;
      console.log('URL de recherche:', searchUrl);

      // Étape 2: Utilisation d'une API de scraping (simulation plus réaliste)
      setImportStatus('Recherche sur Google Maps...');
      setImportProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Étape 3: Scraping réel via une API publique (ex: Places API ou scraping direct)
      setImportStatus('Extraction des données...');
      setImportProgress(50);
      
      // Simulation d'un vrai scraping avec des données plus réalistes
      const realScrapingResults = await fetchRealGoogleMapsData(scrapingKeyword, scrapingLocation);
      
      setImportStatus('Traitement des résultats...');
      setImportProgress(75);
      await new Promise(resolve => setTimeout(resolve, 800));

      setScrapingResults(realScrapingResults);
      setImportStatus(`${realScrapingResults.length} entreprises réelles trouvées et prêtes à l\'importation`);
      setImportProgress(100);

      // Étape 4: Ouverture automatique du modal de campagne
      setTimeout(() => {
        setCampaignName(''); // Réinitialiser le nom de campagne
        setPendingFile(new File([JSON.stringify(realScrapingResults)], `scraping_${scrapingKeyword}_${scrapingLocation}.json`, { type: 'application/json' }));
        setCampaignModalOpen(true);
        closeScrapingModal();
      }, 1500);

    } catch (error: unknown) {
      console.error('Erreur scraping:', error);
      setImportStatus('Erreur lors du scraping: ' + (error as Error).message);
    } finally {
      setIsScraping(false);
    }
  };

  // Fonction de scraping avec l'API Serper.dev et configuration Supabase
  const fetchRealGoogleMapsData = async (keyword: string, location: string): Promise<any[]> => {
    try {
      console.log(`Recherche réelle: ${keyword} à ${location}`);
      
      // Récupérer la configuration depuis Supabase
      console.log('Récupération de la configuration depuis Supabase...');
      const config = await configService.get();
      console.log('Configuration récupérée:', config);
      
      const serperKey = config?.serperKey;
      
      if (!serperKey) {
        console.error('Configuration:', config);
        throw new Error('Clé API Serper.dev non configurée dans Supabase. Veuillez configurer la clé dans les paramètres.');
      }
      
      console.log('Clé Serper trouvée, longueur:', serperKey.length);
      console.log('Début de la requête Serper.dev...');
      
      // Utiliser l'API Serper.dev Places endpoint
      const query = `${keyword} ${location}`;
      console.log('Query:', query);
      
      const response = await fetch('https://google.serper.dev/places', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          gl: 'fr',
          hl: 'fr',
          num: 10
        })
      });

      console.log('Status de la réponse:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur API Serper: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Résultats Serper.dev bruts:', data);
      
      if (!data.places || !Array.isArray(data.places)) {
        console.error('Format de réponse invalide:', data);
        throw new Error('Format de réponse invalide de l\'API Serper.dev');
      }
      
      // Conversion des résultats en format Lead
      const leads = data.places.map((result: any) => {
        console.log('Traitement du résultat:', result);
        return {
          id: crypto.randomUUID(),
          name: result.title || result.name || '',
          company: result.title || result.name || '',
          email: result.email || '',
          phone: result.phone || '',
          website: result.website || '',
          address: result.address || '',
          sector: keyword,
          city: location,
          score: Math.floor((result.rating || 4.0) * 20) + 20, // Convertir rating 1-5 en score 20-120
          temperature: (result.rating || 4.0) >= 4.5 ? 'hot' : (result.rating || 4.0) >= 4.0 ? 'warm' : 'cold',
          tags: ['Serper.dev API', keyword, location, 'Note: ' + (result.rating || 4.0).toFixed(1)],
          campaign: '',
          campaignDate: new Date().toISOString(),
          source: `Serper.dev Google Maps - ${keyword} ${location}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      console.log(`${leads.length} entreprises trouvées via Serper.dev`);
      console.log('Leads générés:', leads);
      return leads;
      
    } catch (error) {
      console.error('Erreur détaillée lors du scraping Serper.dev:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Message d\'erreur:', errorMessage);
      throw new Error(`Erreur Serper.dev: ${errorMessage}`);
    }
  };

  // --- FILE PARSING ---
  const parseFile = useCallback((file: File) => {
    console.log('Début import fichier:', file.name, file.size, file.type);
    setPendingFile(file);
    setCampaignName(''); // Réinitialiser le nom de campagne
    setCampaignModalOpen(true);
  }, []);

  const executeImport = useCallback(() => {
    console.log('=== DIAGNOSTIC executeImport ===');
    console.log('pendingFile:', pendingFile);
    console.log('scrapingResults:', scrapingResults);
    console.log('scrapingResults length:', scrapingResults?.length);
    console.log('scrapingResults type:', typeof scrapingResults);
    console.log('Array.isArray(scrapingResults):', Array.isArray(scrapingResults));
    console.log('campaignName:', campaignName);
    console.log('campaignName.trim():', campaignName.trim());
    console.log('campaignName.trim() length:', campaignName.trim().length);
    
    // Vérifier si on a des données à importer (fichier OU résultats de scraping)
    const hasData = pendingFile || (scrapingResults && scrapingResults.length > 0);
    console.log('hasData:', hasData);
    
    if (!hasData) {
      console.error('DIAGNOSTIC: Aucune donnée trouvée - pendingFile:', !!pendingFile, 'scrapingResults:', scrapingResults);
      alert('Aucune donnée à importer');
      return;
    }
    
    if (!campaignName || !campaignName.trim() || campaignName.trim().length === 0) {
      alert('Veuillez entrer un nom de campagne');
      return;
    }

    // Si on a des résultats de scraping, les convertir en fichier JSON
    if (!pendingFile && scrapingResults && scrapingResults.length > 0) {
      console.log('Utilisation des résultats de scraping');
      const jsonData = scrapingResults.map(result => ({
        name: result.name || '',
        email: result.email || '',
        phone: result.phone || '',
        website: result.website || '',
        address: result.address || '',
        sector: result.sector || '',
        city: result.city || '',
        score: result.score || 50,
        temperature: result.temperature || 'cold',
        tags: Array.isArray(result.tags) ? result.tags : [],
        campaign: campaignName.trim(),
        campaignDate: new Date().toISOString(),
        source: result.source || 'Scraping Google Maps',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // Importer directement les données JSON
      console.log('Importation des données de scraping:', jsonData);
      
      // Ajouter les leads
      addLeads(jsonData);
      
      // Émettre des événements de synchronisation
      eventBus.emit(LeadForgeEvents.LEADS_CHANGED);
      eventBus.emit(LeadForgeEvents.LEAD_ADDED, jsonData.length);
      eventBus.emit(LeadForgeEvents.CAMPAIGNS_CHANGED);
      eventBus.emit(LeadForgeEvents.CAMPAIGN_ADDED, campaignName.trim());
      eventBus.emit(LeadForgeEvents.DATA_REFRESH);
      
      // Fermer le modal et réinitialiser
      setCampaignModalOpen(false);
      setCampaignName('');
      setScrapingResults([]);
      setImporting(false);
      setImportProgress(0);
      setImportStatus('');
      
      return;
    }

    const file = pendingFile;
    console.log('Début import campagne:', campaignName);
    setImporting(true);
    setImportProgress(0);
    setImportStatus('Analyse du fichier...');
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    console.log('Extension détectée:', ext);

    if (ext === 'json') {
      // Gestion des fichiers JSON (scraping)
      console.log('Parsing JSON...');
      setImportStatus('Parsing JSON...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          console.log('JSON parsing complete:', jsonData);
          
          const totalRows = Array.isArray(jsonData) ? jsonData.length : 0;
          setImportTotal(totalRows);
          setImportStatus('Mapping des données...');
          setImportProgress(25);
          
          setTimeout(() => {
            // Convertir les données JSON en format Lead
            const mappedLeads = jsonData.map((item: any) => ({
              id: crypto.randomUUID(),
              name: item.name || '',
              company: item.name || '',
              email: item.email || '',
              phone: item.phone || '',
              website: item.website || '',
              address: item.address || '',
              sector: item.sector || '',
              city: item.city || '',
              score: item.score || 50,
              temperature: item.temperature || 'cold',
              tags: Array.isArray(item.tags) ? item.tags : [],
              campaign: campaignName.trim(),
              campaignDate: new Date().toISOString(),
              source: `Scraping Google Maps - ${scrapingKeyword} ${scrapingLocation}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            
            setImportProgress(75);
            setImportStatus(`Importation de ${mappedLeads.length} leads...`);
            
            setTimeout(() => {
              console.log('Mapped leads from JSON:', mappedLeads);
              addLeads(mappedLeads);
              setImportProgress(100);
              setImportStatus('Importation terminée!');
              
              // Émettre des événements de synchronisation
              eventBus.emit(LeadForgeEvents.LEADS_CHANGED);
              eventBus.emit(LeadForgeEvents.LEAD_ADDED, mappedLeads.length);
              eventBus.emit(LeadForgeEvents.CAMPAIGNS_CHANGED);
              eventBus.emit(LeadForgeEvents.CAMPAIGN_ADDED, campaignName.trim());
              eventBus.emit(LeadForgeEvents.DATA_REFRESH);
              
              // Fermer le modal de campagne après 1 seconde
              setTimeout(() => {
                setCampaignModalOpen(false);
                setCampaignName('');
                setPendingFile(null);
                setImporting(false);
                setImportProgress(0);
                setImportStatus('');
              }, 1000);
              
              // Recharger automatiquement les leads
              setTimeout(() => {
                loadLeads();
                setTimeout(() => {
                  loadLeads();
                }, 1000);
              }, 1000);
            }, 1000);
          });
        } catch (error) {
          console.error('JSON parsing error:', error);
          setImportStatus('Erreur: Format JSON invalide');
          setImporting(false);
        }
      };
      reader.readAsText(file!);
      
    } else if (ext === 'csv' || ext === 'txt') {
      console.log('Parsing CSV/TXT...');
      setImportStatus('Parsing CSV...');
      Papa.parse(file!, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('CSV parsing complete:', results);
          const headers = results.meta.fields || [];
          console.log('Headers:', headers);
          if (!headers || !Array.isArray(headers)) {
            console.error('CSV parsing: no headers found');
            setImporting(false);
            return;
          }
          
          const totalRows = results.data.length;
          setImportTotal(totalRows);
          setImportStatus('Mapping des données...');
          setImportProgress(25);
          
          setTimeout(() => {
            const mappedLeads = mapColumns(results.data, headers);
            // Ajouter les informations de campagne aux leads
            const leadsWithCampaign = mappedLeads.map(lead => ({
              ...lead,
              campaign: campaignName.trim(),
              campaignDate: new Date().toISOString(),
              source: file.name
            }));
            
            setImportProgress(75);
            setImportStatus(`Importation de ${leadsWithCampaign.length} leads...`);
            
            setTimeout(() => {
              console.log('Mapped leads:', leadsWithCampaign);
              addLeads(leadsWithCampaign);
              setImportProgress(100);
              setImportStatus('Importation terminée!');
              
              // Émettre des événements de synchronisation
              eventBus.emit(LeadForgeEvents.LEADS_CHANGED);
              eventBus.emit(LeadForgeEvents.LEAD_ADDED, leadsWithCampaign.length);
              eventBus.emit(LeadForgeEvents.CAMPAIGNS_CHANGED);
              eventBus.emit(LeadForgeEvents.CAMPAIGN_ADDED, campaignName.trim());
              eventBus.emit(LeadForgeEvents.DATA_REFRESH);
              
              // Fermer le modal de campagne après 1 seconde
              setTimeout(() => {
                setCampaignModalOpen(false);
                setCampaignName('');
                setPendingFile(null);
                setImporting(false);
                setImportProgress(0);
                setImportStatus('');
                setImportTotal(0);
              }, 1000);
              
              // Recharger automatiquement les leads
              setTimeout(() => {
                loadLeads();
                // Recharger à nouveau pour s'assurer que tous les leads sont là
                setTimeout(() => {
                  loadLeads();
                }, 1000);
              }, 1000);
            }, 1000);
          }, 300);
        },
        error: (error) => { 
          console.error('CSV parsing error:', error);
          setImporting(false); 
          alert('Erreur de parsing CSV: ' + error); 
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      setImporting(true);
      setImportProgress(0);
      setImportStatus('Analyse du fichier Excel...');

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

          if (data.length === 0) { setImporting(false); return; }

          setImportTotal(data.length);
          setImportProgress(25);
          setImportStatus('Mapping des données...');

          setTimeout(() => {
            const headers = Object.keys(data[0]);
            const mappedLeads = mapColumns(data, headers);
            const leadsWithCampaign = mappedLeads.map(lead => ({
              ...lead,
              campaign: campaignName.trim(),
              campaignDate: new Date().toISOString(),
              source: file!.name
            }));

            setImportProgress(75);
            setImportStatus(`Importation de ${leadsWithCampaign.length} leads...`);

            setTimeout(() => {
              addLeads(leadsWithCampaign);
              setImportProgress(100);
              setImportStatus('Importation terminée!');

              setTimeout(() => {
                loadLeads();
                setTimeout(() => {
                  loadLeads();
                  setImporting(false);
                  setCampaignModalOpen(false);
                  setCampaignName('');
                  setPendingFile(null);
                  setImportProgress(0);
                  setImportStatus('');
                  setImportTotal(0);
                }, 1000);
              }, 1500);
            }, 1000);
          }, 300);
        } catch (error) {
          setImporting(false);
          alert('Erreur de parsing Excel: ' + error);
        }
      };
      reader.readAsBinaryString(file!);
    } else {
      console.error('Format non supporté:', ext);
      alert('Format non supporté. Utilisez CSV, TXT, XLS ou XLSX.');
      setImporting(false);
    }
  }, [pendingFile, campaignName, addLeads, loadLeads]);

  // --- CAMPAIGN MANAGEMENT ---
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  // --- FILTERING & SORTING ---
  let filtered = leads.filter(l => {
    if (filterCampaign && l.campaign !== filterCampaign) return false;
    if (filterEmail === 'with' && !l.email) return false;
    if (filterEmail === 'without' && l.email) return false;
    if (filterWebsite === 'with' && (!l.website || (l.tags || []).includes('Sans site'))) return false;
    if (filterWebsite === 'without' && l.website && !(l.tags || []).includes('Sans site')) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageLeads = filtered.slice(page * perPage, (page + 1) * perPage);
  const sectors = [...new Set(leads.map(l => l.sector).filter(Boolean))];
  // Fusionner les campagnes du hook et des leads pour éviter le décalage
  const allCampaigns = [...new Set([...campaigns.map(c => c.name), ...leads.map(l => l.campaign).filter(Boolean)])];
  const campaignList = allCampaigns.filter(c => typeof c === 'string');
  
  // Debug pour voir les données
  console.log('campaigns from hook:', campaigns);
  console.log('campaignList:', campaignList);

  const stats = {
    total: leads.length,
    noSite: leads.filter(l => !l.website || (l.tags || []).includes('Sans site')).length,
    withSite: leads.filter(l => l.website && !(l.tags || []).includes('Sans site')).length,
    noEmail: leads.filter(l => !l.email).length,
    withEmail: leads.filter(l => l.email).length,
    emailPercentage: leads.length > 0 ? Math.round((leads.filter(l => l.email).length / leads.length) * 100) : 0,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length) : 0,
    avgScoreWithEmail: leads.filter(l => l.email).length > 0 
      ? Math.round(leads.filter(l => l.email).reduce((s, l) => s + l.score, 0) / leads.filter(l => l.email).length) 
      : 0,
    veryHot: leads.filter(l => l.temperature === 'very_hot').length,
    totalCampaigns: campaignsCount, // Utilise l'état local synchronisé
  };

  // --- CALCUL INTÉLLIGENT DES COMPTEURS DE FILTRES ---
  const getFilterCount = (filterType: string, filterValue: string) => {
    if (!filterValue) return 0;
    
    return leads.filter(lead => {
      switch (filterType) {
        case 'campaign':
          return lead.campaign === filterValue;
        case 'email':
          if (filterValue === 'with') return !!lead.email;
          if (filterValue === 'without') return !lead.email;
          return false;
        case 'website':
          if (filterValue === 'with') return !!(lead.website && !lead.tags.includes('Sans site'));
          if (filterValue === 'without') return !lead.website || lead.tags.includes('Sans site');
          return false;
        default:
          return false;
      }
    }).length;
  };

  // Calcul des compteurs pour les filtres actifs
  const activeFilters: Array<{ type: string; value: string; label: string }> = [];
  if (filterCampaign) activeFilters.push({ type: 'campaign', value: filterCampaign, label: `Campagne: ${filterCampaign}` });
  if (filterEmail) activeFilters.push({ type: 'email', value: filterEmail, label: `Email: ${filterEmail === 'with' ? 'Avec' : 'Sans'}` });
  if (filterWebsite) activeFilters.push({ type: 'website', value: filterWebsite, label: `Site: ${filterWebsite === 'with' ? 'Avec' : 'Sans'}` });

  // Calcul intelligent: si plusieurs filtres, montrer le résultat combiné
  const getCombinedFilterText = () => {
    if (activeFilters.length === 0) return '';
    if (activeFilters.length === 1) return `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`;
    
    const filterLabels = activeFilters.map(f => f.label).join(' + ');
    return `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} pour ${filterLabels}`;
  };

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === pageLeads.length) setSelected(new Set());
    else setSelected(new Set(pageLeads.map(l => l.id)));
  };

  const openPanel = (lead: Lead, mode: 'view' | 'edit') => {
    setPanelLeadId(lead.id);
    setPanelMode(mode);
    if (mode === 'edit') setEditData({ ...lead });
  };

  const closePanel = () => {
    setPanelLeadId(null);
    setPanelMode('view');
    setEditData(null);
  };

  const saveEdit = () => {
    if (editData) {
      updateLead(editData.id, editData);
      setPanelMode('view');
      setEditData(null);
    }
  };

  return (
    <div className="animate-fade" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 28,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: C.bg,
        padding: '20px 0',
        borderBottom: `1px solid ${C.border}`
      }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: C.tx, marginBottom: 4 }}>
            Lead Dashboard
          </h1>
          <p style={{ color: C.tx3, fontSize: 14 }}>Importez, filtrez et gérez tous vos leads B2B — cliquez sur un lead pour voir ses détails</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.size > 0 && (
            <button onClick={() => { 
              const selectedIds = [...selected];
              deleteLeads(selectedIds); 
              setSelected(new Set());
              
              // Émettre des événements de synchronisation
              eventBus.emit(LeadForgeEvents.LEADS_CHANGED);
              eventBus.emit(LeadForgeEvents.LEAD_DELETED, selectedIds.length);
              eventBus.emit(LeadForgeEvents.CAMPAIGNS_CHANGED);
              eventBus.emit(LeadForgeEvents.DATA_REFRESH);
            }} style={{
              padding: '9px 16px', borderRadius: 6, border: `1px solid ${C.red}`, background: '#fff',
              color: C.red, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>Supprimer ({selected.size})</button>
          )}
          <button onClick={() => exportLeadsCSV(filtered)} style={{
            padding: '9px 16px', borderRadius: 6, border: `1px solid ${C.border}`, background: '#fff',
            color: C.tx2, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>↓ Exporter CSV</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => fileRef.current?.click()} style={{
              padding: '9px 18px', borderRadius: 6, border: 'none', background: C.accent,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>📁 Importer</button>
            <div 
              style={{ 
                position: 'absolute', 
                bottom: -6, 
                right: -6, 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                background: C.border, 
                color: C.tx3, 
                fontSize: 9, 
                fontWeight: 'bold',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'help',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={() => handleIconMouseEnter('import')}
              onMouseLeave={handleIconMouseLeave}
            >
              ?
            </div>
            {hoveredButton === 'import' && (
              <>
                {/* Zone de connection invisible entre l'icône et le tooltip */}
                <div style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 40,
                  height: 30,
                  zIndex: 999,
                }}
                onMouseEnter={handleAnyMouseEnter}
                onMouseLeave={handleAnyMouseLeave}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 15,
                  left: '50%',
                  transform: 'translateX(-50%) translateY(100%)',
                  background: C.tx,
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: '1.4',
                  whiteSpace: 'normal',
                  width: 'auto',
                  minWidth: '220px',
                  maxWidth: '280px',
                  zIndex: 1000,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  textAlign: 'left'
                }}
                onMouseEnter={handleAnyMouseEnter}
                onMouseLeave={handleAnyMouseLeave}
                >
                  <strong>📁 Importation de fichiers</strong><br/>
                  Supporte CSV, Excel (.xlsx, .xls) et TXT<br/>
                  Idéal pour importer vos listes de leads existantes
                </div>
              </>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={openScrapingModal} style={{
              padding: '9px 18px', borderRadius: 6, border: 'none', background: C.accent,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>🗺️ Scraper</button>
            <div 
              style={{ 
                position: 'absolute', 
                bottom: -6, 
                right: -6, 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                background: C.border, 
                color: C.tx3, 
                fontSize: 9, 
                fontWeight: 'bold',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'help',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={() => handleIconMouseEnter('scraping')}
              onMouseLeave={handleIconMouseLeave}
            >
              ?
            </div>
            {hoveredButton === 'scraping' && (
              <>
                {/* Zone de connection invisible entre l'icône et le tooltip */}
                <div style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 40,
                  height: 30,
                  zIndex: 999,
                }}
                onMouseEnter={handleAnyMouseEnter}
                onMouseLeave={handleAnyMouseLeave}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 15,
                  left: '50%',
                  transform: 'translateX(-50%) translateY(100%)',
                  background: C.tx,
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: '1.4',
                  whiteSpace: 'normal',
                  width: 'auto',
                  minWidth: '240px',
                  maxWidth: '300px',
                  zIndex: 1000,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  textAlign: 'left'
                }}
                onMouseEnter={handleAnyMouseEnter}
                onMouseLeave={handleAnyMouseLeave}
                >
                  <strong>🗺️ Scraping Google Maps</strong><br/>
                  Mot-clé + localisation<br/>
                  Trouve automatiquement des entreprises<br/>
                  avec leurs coordonnées complètes
                </div>
              </>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={openLinkScrapingModal} style={{
              padding: '9px 18px', borderRadius: 6, border: 'none', background: C.accent,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>🔗 Lien</button>
            <div 
              style={{ 
                position: 'absolute', 
                bottom: -6, 
                right: -6, 
                width: 14, 
                height: 14, 
                borderRadius: '50%', 
                background: C.border, 
                color: C.tx3, 
                fontSize: 9, 
                fontWeight: 'bold',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'help',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={() => handleIconMouseEnter('link')}
              onMouseLeave={handleIconMouseLeave}
            >
              ?
            </div>
            {hoveredButton === 'link' && (
              <>
                {/* Zone de connection invisible entre l'icône et le tooltip */}
                <div style={{
                  position: 'absolute',
                  bottom: -10,
                  right: -10,
                  width: 40,
                  height: 30,
                  zIndex: 999,
                }}
                onMouseEnter={handleAnyMouseEnter}
                onMouseLeave={handleAnyMouseLeave}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 15,
                  right: 0,
                  transform: 'translateY(100%)',
                  background: C.tx,
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  lineHeight: '1.4',
                  whiteSpace: 'normal',
                  width: 'auto',
                  minWidth: '260px',
                  maxWidth: '320px',
                  zIndex: 1000,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  textAlign: 'left'
                }}
                onMouseEnter={handleAnyMouseEnter}
                onMouseLeave={handleAnyMouseLeave}
                >
                  <strong>🔗 Scraping par lien</strong><br/>
                  Collez un lien Google Maps direct<br/>
                  Extrait automatiquement toutes les entreprises<br/>
                  trouvées dans la recherche
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = ''; }} />
        </div>
      </div>

      
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* 1. Total Leads */}
        <div style={{
          background: C.surface, borderRadius: 8, padding: '20px 22px',
          borderLeft: `3px solid ${C.accent}`,
          boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
        }}>
          <div style={{ fontSize: 12, color: C.tx3, fontWeight: 500, marginBottom: 6 }}>Total Leads</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: C.tx3, marginTop: 4 }}>Tous les leads</div>
        </div>
        
        {/* 2. Total Campagnes */}
        <div style={{
          background: C.surface, borderRadius: 8, padding: '20px 22px',
          borderLeft: `3px solid ${C.accent}`,
          boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
        }}>
          <div style={{ fontSize: 12, color: C.tx3, fontWeight: 500, marginBottom: 6 }}>Total Campagnes</div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.totalCampaigns}</div>
          <div style={{ fontSize: 11, color: C.tx3, marginTop: 4 }}>Importations actives</div>
        </div>
        
        {/* 3. Emails */}
        <div style={{
          background: C.surface, borderRadius: 8, padding: '20px 22px',
          borderLeft: `3px solid ${C.green}`,
          boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
        }}>
          <div style={{ fontSize: 12, color: C.tx3, fontWeight: 500, marginBottom: 12 }}>Emails</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.noEmail}</div>
              <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Sans email</div>
            </div>
            <div style={{ width: 1, height: 40, background: C.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.withEmail}</div>
              <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Avec email</div>
            </div>
          </div>
        </div>
        
        {/* 4. Sites Web */}
        <div style={{
          background: C.surface, borderRadius: 8, padding: '20px 22px',
          borderLeft: `3px solid ${C.blue}`,
          boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
        }}>
          <div style={{ fontSize: 12, color: C.tx3, fontWeight: 500, marginBottom: 12 }}>Sites Web</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.noSite}</div>
              <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Sans site</div>
            </div>
            <div style={{ width: 1, height: 40, background: C.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.withSite}</div>
              <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Avec site</div>
            </div>
          </div>
        </div>
        
        {/* 5. Taux Email */}
        <div style={{
          background: C.surface, borderRadius: 8, padding: '20px 22px',
          borderLeft: `3px solid ${C.amber}`,
          boxShadow: '0 1px 3px rgba(28,27,24,0.06)',
        }}>
          <div style={{ fontSize: 12, color: C.tx3, fontWeight: 500, marginBottom: 12 }}>Taux Email</div>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Fraunces', serif", color: C.tx }}>{stats.emailPercentage}%</div>
            <div style={{ fontSize: 11, color: C.tx3, marginTop: 2 }}>Leads contactables</div>
          </div>
          <div style={{ fontSize: 10, color: C.tx3, textAlign: 'center' }}>
            {stats.withEmail} / {stats.total} leads
          </div>
        </div>
      </div>

      {/* Import zone */}
      {leads.length === 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragOver ? C.accent : C.border}`,
            borderRadius: 12, padding: '60px 40px', textAlign: 'center',
            background: isDragOver ? C.accent2 : C.surface,
            transition: 'all 200ms', cursor: 'pointer', marginBottom: 24,
          }}
          onClick={() => fileRef.current?.click()}
        >
          {importing ? (
            <div style={{ color: C.accent }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Import en cours...</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: C.tx, marginBottom: 8 }}>
                Glissez-déposez votre fichier de leads ici
              </div>
              <div style={{ fontSize: 14, color: C.tx3, marginBottom: 16 }}>
                CSV, Excel (.xlsx), TXT — Parsing intelligent des colonnes
              </div>
              <div style={{
                display: 'inline-block', padding: '10px 24px', borderRadius: 6,
                background: C.accent, color: '#fff', fontWeight: 600, fontSize: 14,
              }}>Choisir un fichier</div>
            </>
          )}
        </div>
      )}

      {/* Google Maps Scraping Section - Visible tout le temps */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            padding: '20px 22px',
            borderRadius: 8,
            border: `2px dashed ${C.accent}`,
            background: C.surface2,
            transition: 'all 200ms', cursor: 'pointer',
            fontSize: 13, color: C.accent,
            textAlign: 'center',
          }}
          onClick={openScrapingModal}
        >
          🗺️ Scraper depuis Google Maps — recherchez des entreprises par mot-clé et emplacement
        </div>
        <div style={{
            flex: 1,
            padding: '20px 22px',
            borderRadius: 8,
            border: `2px dashed ${C.accent}`,
            background: C.surface2,
            transition: 'all 200ms', cursor: 'pointer',
            fontSize: 13, color: C.accent,
            textAlign: 'center',
          }}
          onClick={openLinkScrapingModal}
        >
          🔗 Scraper par lien Google Maps — collez un lien de recherche direct
        </div>
      </div>

      {/* Filters & Table */}
      {leads.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                flex: 1,
                padding: '20px 22px',
                borderRadius: 8,
                border: `2px dashed ${C.border}`,
                background: isDragOver ? C.accent2 : C.surface2,
                transition: 'all 200ms', cursor: 'pointer',
                fontSize: 13, color: C.tx3,
                textAlign: 'center',
              }}
              onClick={() => fileRef.current?.click()}
            >
              � Glissez un fichier ici pour ajouter des leads — ou cliquez pour parcourir
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filterCampaign} onChange={e => { setFilterCampaign(e.target.value); setPage(0); }}
              style={{ padding: '9px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              <option value="">Toutes campagnes</option>
              {campaignList.map(c => {
                const campaignName = typeof c === 'string' ? c : String(c);
                return <option key={campaignName} value={campaignName}>{campaignName} ({getFilterCount('campaign', campaignName)})</option>
              })}
            </select>
            <select value={filterEmail} onChange={e => { setFilterEmail(e.target.value); setPage(0); }}
              style={{ padding: '9px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              <option value="">Email: tous</option>
              <option value="with">✅ Avec email ({getFilterCount('email', 'with')})</option>
              <option value="without">❌ Sans email ({getFilterCount('email', 'without')})</option>
            </select>
            <select value={filterWebsite} onChange={e => { setFilterWebsite(e.target.value); setPage(0); }}
              style={{ padding: '9px 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              <option value="">Site web: tous</option>
              <option value="with">🌐 Avec site ({getFilterCount('website', 'with')})</option>
              <option value="without">📱 Sans site ({getFilterCount('website', 'without')})</option>
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.tx2 }}>
              <span>Résultats par page:</span>
              <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(0); }}
                style={{ padding: '6px 10px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          {/* Affichage intelligent des résultats */}
          {getCombinedFilterText() && (
            <div style={{
              background: C.accent2, borderRadius: 8, padding: '12px 16px', marginBottom: 16,
              border: `1px solid ${C.accent}`, fontSize: 13, color: C.accent,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 600 }}>
                📊 {getCombinedFilterText()}
              </span>
              <span style={{ color: C.tx3, fontSize: 12 }}>
                sur {leads.length} lead{leads.length > 1 ? 's' : ''} total
              </span>
            </div>
          )}

          {/* Table */}
          <div style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.surface2 }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', width: 40 }}>
                      <input type="checkbox" checked={selected.size === pageLeads.length && pageLeads.length > 0}
                        onChange={toggleAll} style={{ accentColor: C.accent }} />
                    </th>
                    {[
                      { field: 'name' as keyof Lead, label: 'Nom' },
                      { field: 'email' as keyof Lead, label: 'Email' },
                      { field: 'phone' as keyof Lead, label: 'Téléphone' },
                      { field: 'sector' as keyof Lead, label: 'Secteur' },
                      { field: 'city' as keyof Lead, label: 'Ville' },
                      { field: 'campaign' as keyof Lead, label: 'Campagne' },
                      { field: 'score' as keyof Lead, label: 'Score' },
                      { field: 'temperature' as keyof Lead, label: 'Statut' },
                      { field: 'stage' as keyof Lead, label: 'Étape' },
                    ].map(col => (
                      <th key={col.field} onClick={() => handleSort(col.field)} style={{
                        padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
                        fontWeight: 600, color: C.tx2, fontSize: 11, textTransform: 'uppercase',
                        letterSpacing: '0.5px', whiteSpace: 'nowrap', userSelect: 'none',
                      }}>
                        {col.label} {sortField === col.field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                      </th>
                    ))}
                    <th style={{ padding: '10px 12px', width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pageLeads.map((lead, i) => (
                    <tr key={lead.id} style={{
                      borderTop: `1px solid ${C.border}`,
                      background: i % 2 === 0 ? C.surface : C.surface2,
                      cursor: 'pointer',
                      transition: 'background 150ms',
                    }}
                    onClick={() => openPanel(lead, 'view')}
                    onMouseEnter={e => (e.currentTarget.style.background = C.accent2)}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? C.surface : C.surface2)}
                    >
                      <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)} style={{ accentColor: C.accent }} />
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: C.tx, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.name || '—'}
                        {lead.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                            {lead.tags.slice(0, 2).map(t => (
                              <span key={t} style={{
                                fontSize: 10, padding: '1px 6px', borderRadius: 3,
                                background: t === 'Sans site' ? '#dbeafe' : t === 'Prioritaire' ? '#fef3c7' : C.surface2,
                                color: t === 'Sans site' ? C.blue : t === 'Prioritaire' ? C.amber : C.tx3,
                                fontWeight: 600,
                              }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.tx2 }}>{lead.email || '—'}</td>
                      <td style={{ padding: '10px 12px', fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.tx2 }}>{lead.phone || '—'}</td>
                      <td style={{ padding: '10px 12px', color: C.tx2 }}>{lead.sector || '—'}</td>
                      <td style={{ padding: '10px 12px', color: C.tx2 }}>{lead.city || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {lead.campaign ? (
                          <div>
                            <div style={{ fontWeight: 500, color: C.tx, fontSize: 12 }}>{lead.campaign}</div>
                            {lead.campaignDate && (
                              <div style={{ fontSize: 10, color: C.tx3, fontFamily: "'DM Mono', monospace" }}>
                                {new Date(lead.campaignDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: C.tx3 }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {lead.score > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 50, height: 4, borderRadius: 2, background: C.surface2, overflow: 'hidden' }}>
                              <div className="animate-grow" style={{
                                height: '100%', borderRadius: 2,
                                width: `${lead.score}%`,
                                background: lead.score >= 80 ? C.green : lead.score >= 60 ? C.amber : C.tx3,
                              }} />
                            </div>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 12 }}>{lead.score}</span>
                          </div>
                        ) : <span style={{ color: C.tx3 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {lead.temperature ? (
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 3,
                            background: tempColors[lead.temperature]?.bg, color: tempColors[lead.temperature]?.text,
                          }}>{tempColors[lead.temperature]?.label}</span>
                        ) : <span style={{ color: C.tx3 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, color: C.tx3 }}>
                          {stageLabels[lead.stage] || lead.stage}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openPanel(lead, 'view')} style={{
                            padding: '4px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                            background: C.surface, fontSize: 12, cursor: 'pointer', color: C.blue,
                          }}>👁️</button>
                          <button onClick={() => openPanel(lead, 'edit')} style={{
                            padding: '4px 8px', borderRadius: 4, border: `1px solid ${C.border}`,
                            background: C.surface, fontSize: 12, cursor: 'pointer', color: C.tx2,
                          }}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pageLeads.length === 0 && (
                    <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: C.tx3 }}>
                      {leads.length > 0 ? 'Aucun lead ne correspond aux filtres' : 'Aucun lead importé'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderTop: `1px solid ${C.border}`, fontSize: 13,
              }}>
                <span style={{ color: C.tx3 }}>{filtered.length} résultat(s) — Page {page + 1}/{totalPages}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    style={{ padding: '6px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.surface, cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontSize: 13 }}>← Préc</button>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    style={{ padding: '6px 12px', borderRadius: 4, border: `1px solid ${C.border}`, background: C.surface, cursor: page >= totalPages - 1 ? 'default' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1, fontSize: 13 }}>Suiv →</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================== */}
      {/* DETAIL / EDIT SLIDE PANEL      */}
      {/* ============================== */}
      {panelLead && (
        <>
          {/* Overlay */}
          <div onClick={closePanel} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.25)', zIndex: 99,
          }} />

          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 560,
            background: C.surface, boxShadow: '-6px 0 30px rgba(0,0,0,0.15)',
            zIndex: 100, overflowY: 'auto', fontFamily: "'Bricolage Grotesque', sans-serif",
          }}>
            {/* Panel Header */}
            <div style={{
              padding: '24px 28px 16px', borderBottom: `1px solid ${C.border}`,
              background: C.bg, position: 'sticky', top: 0, zIndex: 2,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: C.tx, marginBottom: 6 }}>
                    {panelLead.name || 'Lead sans nom'}
                  </h2>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {panelLead.temperature && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
                        background: tempColors[panelLead.temperature]?.bg,
                        color: tempColors[panelLead.temperature]?.text,
                      }}>{tempColors[panelLead.temperature]?.label}</span>
                    )}
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 4,
                      background: C.surface2, color: C.tx2,
                    }}>{stageLabels[panelLead.stage]}</span>
                    {panelLead.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 3,
                        background: tag === 'Sans site' ? '#dbeafe' : tag === 'Prioritaire' ? '#fef3c7' : C.surface2,
                        color: tag === 'Sans site' ? C.blue : tag === 'Prioritaire' ? C.amber : C.tx3,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button onClick={closePanel} style={{
                  width: 34, height: 34, borderRadius: 6, border: `1px solid ${C.border}`,
                  background: C.surface, fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>✕</button>
              </div>
              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setPanelMode('view'); setEditData(null); }} style={{
                  padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${panelMode === 'view' ? C.accent : C.border}`,
                  background: panelMode === 'view' ? C.accent2 : C.surface,
                  color: panelMode === 'view' ? C.accent : C.tx2,
                }}>👁️ Voir les détails</button>
                <button onClick={() => { setPanelMode('edit'); setEditData({ ...panelLead }); }} style={{
                  padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${panelMode === 'edit' ? C.accent : C.border}`,
                  background: panelMode === 'edit' ? C.accent2 : C.surface,
                  color: panelMode === 'edit' ? C.accent : C.tx2,
                }}>✏️ Modifier</button>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {/* ======= VIEW MODE ======= */}
              {panelMode === 'view' && (
                <>
                  {/* Score overview */}
                  {panelLead.score > 0 && (
                    <div style={{
                      background: `linear-gradient(135deg, ${panelLead.score >= 80 ? '#f0fdf4' : panelLead.score >= 60 ? '#fffbeb' : '#f8fafc'}, ${C.surface})`,
                      borderRadius: 10, padding: '20px', marginBottom: 24,
                      border: `1px solid ${panelLead.score >= 80 ? '#bbf7d0' : panelLead.score >= 60 ? '#fed7aa' : C.border}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                          width: 70, height: 70, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                          background: C.surface,
                          border: `3px solid ${panelLead.score >= 80 ? C.green : panelLead.score >= 60 ? C.amber : C.tx3}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: panelLead.score >= 80 ? C.green : panelLead.score >= 60 ? C.amber : C.tx, lineHeight: 1 }}>
                            {panelLead.score}
                          </span>
                          <span style={{ fontSize: 9, color: C.tx3, fontWeight: 500 }}>/100</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: C.tx, marginBottom: 3 }}>Score de Qualité</div>
                          <div style={{ fontSize: 12, color: C.tx2 }}>
                            {panelLead.score >= 80 ? '🔥 Lead à fort potentiel — prioriser le contact' : panelLead.score >= 60 ? '👍 Bon potentiel — à contacter rapidement' : panelLead.score >= 40 ? '📊 Potentiel moyen' : '❄️ Faible potentiel'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact info — ALL FIELDS */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>📇 Informations de Contact</h3>
                    <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                      {[
                        { icon: '🏢', label: 'Nom', value: panelLead.name || '' },
                        { icon: '✉️', label: 'Email', value: panelLead.email || '', mono: true, copy: true },
                        { icon: '📞', label: 'Téléphone', value: panelLead.phone || '', mono: true, copy: true },
                        { icon: '📍', label: 'Adresse', value: panelLead.address || '' },
                        { icon: '🏙️', label: 'Ville', value: panelLead.city || '' },
                        { icon: '📁', label: 'Secteur', value: panelLead.sector || panelLead.serperType || '' },
                        { icon: '🌐', label: 'Site Web', value: panelLead.website || '', mono: true, link: true },
                        { icon: '🗺️', label: 'Google Maps', value: panelLead.googleMapsUrl || '', mono: true, link: true },
                        { icon: '⏰', label: 'Horaires', value: panelLead.hours || panelLead.serperHours || '' },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'grid', gridTemplateColumns: '120px 1fr',
                          padding: '10px 16px', borderBottom: i < 8 ? `1px solid ${C.border}` : 'none',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: 12, color: C.tx3, fontWeight: 500 }}>{item.icon} {item.label}</span>
                          {item.value ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {item.link && typeof item.value === 'string' && item.value.startsWith('http') ? (
                                <a href={item.value} target="_blank" rel="noopener noreferrer" style={{
                                  fontSize: item.mono ? 11 : 13, color: C.blue, textDecoration: 'none',
                                  fontFamily: item.mono ? "'DM Mono', monospace" : "'Bricolage Grotesque', sans-serif",
                                  wordBreak: 'break-all' as const,
                                }}>{item.value} ↗</a>
                              ) : (
                                <span style={{
                                  fontSize: item.mono ? 12 : 13, color: C.tx,
                                  fontFamily: item.mono ? "'DM Mono', monospace" : "'Bricolage Grotesque', sans-serif",
                                }}>{item.value}</span>
                              )}
                              {item.copy && (
                                <button onClick={() => navigator.clipboard.writeText(String(item.value))} style={{
                                  padding: '2px 6px', borderRadius: 3, border: `1px solid ${C.border}`,
                                  background: C.surface, fontSize: 10, cursor: 'pointer', color: C.tx3, flexShrink: 0,
                                }} title="Copier">📋</button>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: C.tx3, fontStyle: 'italic' }}>Non renseigné</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Google presence */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>⭐ Présence Google</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: C.bg, borderRadius: 8, padding: '14px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fraunces', serif", color: panelLead.googleRating >= 4 ? C.green : C.tx3 }}>
                          {panelLead.googleRating > 0 ? panelLead.googleRating.toFixed(1) : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: C.tx3 }}>Note Google</div>
                        {panelLead.googleRating > 0 && (
                          <div style={{ marginTop: 4, fontSize: 13 }}>
                            {'★'.repeat(Math.round(panelLead.googleRating))}{'☆'.repeat(5 - Math.round(panelLead.googleRating))}
                          </div>
                        )}
                      </div>
                      <div style={{ background: C.bg, borderRadius: 8, padding: '14px', border: `1px solid ${C.border}`, textAlign: 'center' }}>
                        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fraunces', serif", color: (typeof panelLead.googleReviews === 'number' ? panelLead.googleReviews : 0) >= 20 ? C.blue : C.tx3 }}>
                          {typeof panelLead.googleReviews === 'number' && panelLead.googleReviews > 0 ? panelLead.googleReviews : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: C.tx3 }}>Avis Google</div>
                      </div>
                    </div>
                  </div>

                  {/* Google Reviews */}
                  {(panelLead.googleReviewsData || []).length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>🗣️ Avis Clients ({panelLead.googleReviewsData.length})</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {panelLead.googleReviewsData.filter(r => r && typeof r === 'object' && typeof r.text === 'string').map((review, i) => {
                          const rating = typeof review.rating === 'number' ? Math.min(5, Math.max(0, review.rating)) : 5;
                          const author = String(review.author || 'Client');
                          const text = String(review.text || '');
                          const date = String(review.date || '');
                          return (
                            <div key={i} style={{
                              background: C.bg, borderRadius: 8, padding: '12px 14px',
                              border: `1px solid ${C.border}`, borderLeft: '3px solid #f59e0b',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: C.tx }}>{author}</span>
                                <span style={{ fontSize: 11, color: '#f59e0b' }}>{'★'.repeat(rating)}</span>
                              </div>
                              <p style={{ fontSize: 11, color: C.tx2, lineHeight: 1.5, margin: 0 }}>
                                &ldquo;{text.length > 120 ? text.substring(0, 120) + '...' : text}&rdquo;
                              </p>
                              {date && <div style={{ fontSize: 9, color: C.tx3, marginTop: 4 }}>{date}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Logo */}
                  {panelLead.logo && (
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>🎨 Logo</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.bg, borderRadius: 8, padding: '14px', border: `1px solid ${C.border}` }}>
                        <img src={panelLead.logo} alt="Logo" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: `2px solid ${C.border}` }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div style={{ fontSize: 12, color: C.tx2 }}>Logo identifié via recherche web</div>
                      </div>
                    </div>
                  )}

                  {/* Description AI */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>💬 Description</h3>
                    {panelLead.description ? (
                      <div style={{
                        background: C.bg, borderRadius: 8, padding: '14px 16px',
                        border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.green}`,
                        fontSize: 13, color: C.tx2, lineHeight: 1.7,
                      }}>{panelLead.description}</div>
                    ) : (
                      <div style={{
                        background: C.bg, borderRadius: 8, padding: '14px 16px',
                        border: `1px dashed ${C.border}`, fontSize: 13, color: C.tx3,
                        textAlign: 'center' as const,
                      }}>Aucune description. Enrichissez ce lead depuis l&apos;Agent 2.</div>
                    )}
                  </div>

                  {/* Serper web snippets */}
                  {panelLead.serperSnippets && panelLead.serperSnippets.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>🔍 Infos Web (Serper)</h3>
                      <div style={{ background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                        {panelLead.serperSnippets.filter((s: string) => typeof s === 'string').map((snippet: string, i: number) => (
                          <div key={i} style={{
                            padding: '10px 16px', fontSize: 12, color: C.tx2, lineHeight: 1.6,
                            borderBottom: i < panelLead.serperSnippets.length - 1 ? `1px solid ${C.border}` : 'none',
                          }}>{snippet}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images — always shown */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>🖼️ Images ({panelLead.images.length})</h3>
                    {panelLead.images.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {panelLead.images.filter(img => typeof img === 'string' && img.startsWith('http')).map((img, i) => (
                          <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}`, aspectRatio: '4/3', background: C.surface2, position: 'relative' as const }}>
                            <img src={img} alt={`Image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              referrerPolicy="no-referrer"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <a href={img} target="_blank" rel="noopener noreferrer" style={{
                              position: 'absolute', bottom: 4, right: 4, padding: '2px 6px',
                              background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 4, fontSize: 10,
                              textDecoration: 'none',
                            }}>↗</a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        background: C.bg, borderRadius: 8, padding: '20px',
                        border: `1px dashed ${C.border}`, fontSize: 13, color: C.tx3,
                        textAlign: 'center' as const,
                      }}>
                        Aucune image. Enrichissez ce lead depuis l&apos;Agent 2 pour trouver des photos.
                      </div>
                    )}
                  </div>

                  {/* Pipeline progress */}
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>📈 Progression Pipeline</h3>
                    <div style={{ background: C.bg, borderRadius: 8, padding: '14px 16px', border: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                        {['new', 'enriched', 'site_generated', 'email_sent', 'interested', 'converted'].map((stage, i) => {
                          const stages = ['new', 'enriched', 'site_generated', 'email_sent', 'interested', 'converted'];
                          const currentIdx = stages.indexOf(panelLead.stage);
                          return (
                            <div key={stage} style={{
                              flex: 1, height: 5, borderRadius: 3,
                              background: i <= currentIdx ? (i === currentIdx ? C.accent : C.green) : C.surface2,
                            }} />
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.tx3 }}>
                        <span>Nouveau</span><span>Enrichi</span><span>Site</span><span>Email</span><span>Intéressé</span><span>Converti</span>
                      </div>
                      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ fontSize: 12, color: C.tx2 }}>
                          <span style={{ color: C.tx3 }}>Site : </span>
                          <span style={{ fontWeight: 500 }}>{panelLead.siteGenerated ? '✅ Généré' : '❌ Non'}</span>
                        </div>
                        <div style={{ fontSize: 12, color: C.tx2 }}>
                          <span style={{ color: C.tx3 }}>Email : </span>
                          <span style={{ fontWeight: 500 }}>{panelLead.emailSent ? '✅ Envoyé' : '❌ Non'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {panelLead.notes && (
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: C.tx, marginBottom: 12 }}>📝 Notes</h3>
                      <div style={{
                        background: '#fffef5', borderRadius: 8, padding: '12px 16px',
                        border: `1px solid #fde68a`, fontSize: 12, color: C.tx2,
                        lineHeight: 1.6, fontFamily: "'DM Mono', monospace",
                      }}>{panelLead.notes}</div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div style={{
                    background: C.bg, borderRadius: 8, padding: '12px 16px',
                    border: `1px solid ${C.border}`, fontSize: 11, color: C.tx3, marginBottom: 20,
                  }}>
                    <div>Créé : <span style={{ fontFamily: "'DM Mono', monospace" }}>{panelLead.createdAt ? new Date(panelLead.createdAt).toLocaleString('fr-FR') : '—'}</span></div>
                    <div>Mis à jour : <span style={{ fontFamily: "'DM Mono', monospace" }}>{panelLead.updatedAt ? new Date(panelLead.updatedAt).toLocaleString('fr-FR') : '—'}</span></div>
                  </div>

                  <button onClick={() => { setPanelMode('edit'); setEditData({ ...panelLead }); }} style={{
                    width: '100%', padding: '11px 0', borderRadius: 6, border: 'none',
                    background: C.accent, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}>✏️ Modifier ce lead</button>
                </>
              )}

              {/* ======= EDIT MODE ======= */}
              {panelMode === 'edit' && editData && (
                <>
                  {[
                    { key: 'name', label: 'Nom', type: 'text' },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'phone', label: 'Téléphone', type: 'text' },
                    { key: 'sector', label: 'Secteur', type: 'text' },
                    { key: 'city', label: 'Ville', type: 'text' },
                    { key: 'address', label: 'Adresse', type: 'text' },
                    { key: 'website', label: 'Site Web', type: 'text' },
                    { key: 'googleMapsUrl', label: 'URL Google Maps', type: 'text' },
                    { key: 'googleRating', label: 'Note Google', type: 'number' },
                    { key: 'googleReviews', label: 'Nombre d\'avis', type: 'number' },
                    { key: 'hours', label: 'Horaires', type: 'text' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    { key: 'notes', label: 'Notes internes', type: 'textarea' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.tx2, marginBottom: 4 }}>{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea
                          value={String((editData as unknown as Record<string, unknown>)[f.key] || '')}
                          onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                          rows={3}
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`,
                            fontSize: 13, resize: 'vertical',
                            fontFamily: f.key === 'notes' ? "'DM Mono', monospace" : "'Bricolage Grotesque', sans-serif",
                            outline: 'none', background: C.bg,
                          }}
                        />
                      ) : (
                        <input
                          type={f.type}
                          value={String((editData as unknown as Record<string, unknown>)[f.key] || '')}
                          onChange={e => setEditData({ ...editData, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                          style={{
                            width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`,
                            fontSize: 13, outline: 'none', background: C.bg,
                            fontFamily: ['email', 'phone', 'googleMapsUrl'].includes(f.key) ? "'DM Mono', monospace" : "'Bricolage Grotesque', sans-serif",
                          }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Tags */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.tx2, marginBottom: 6 }}>Tags</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {allTags.map(tag => {
                        const active = editData.tags.includes(tag);
                        return (
                          <button key={tag} onClick={() => {
                            const newTags = active ? editData.tags.filter(t => t !== tag) : [...editData.tags, tag];
                            setEditData({ ...editData, tags: newTags });
                          }} style={{
                            padding: '5px 12px', borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            border: `1px solid ${active ? C.accent : C.border}`,
                            background: active ? C.accent2 : C.surface,
                            color: active ? C.accent : C.tx2,
                          }}>{tag}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingBottom: 20 }}>
                    <button onClick={saveEdit} style={{
                      flex: 1, padding: '11px 0', borderRadius: 6, border: 'none',
                      background: C.accent, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    }}>✅ Enregistrer</button>
                    <button onClick={() => { setPanelMode('view'); setEditData(null); }} style={{
                      padding: '11px 20px', borderRadius: 6, border: `1px solid ${C.border}`,
                      background: C.surface, color: C.tx2, fontWeight: 500, fontSize: 14, cursor: 'pointer',
                    }}>Annuler</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Campaign Modal */}
      {campaignModalOpen && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9998,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setCampaignModalOpen(false)} />
          <div style={{
            position: 'fixed', top: '10%', left: '50%', transform: 'translate(-50%, 0)',
            background: C.surface, borderRadius: 12, padding: 32,
            width: 480, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            zIndex: 9999,
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: C.tx }}>
              Nommer la campagne d'importation
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, color: C.tx2, lineHeight: 1.5 }}>
              Donnez un nom à cette campagne pour retrouver facilement vos leads plus tard.
            </p>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.tx2, marginBottom: 6 }}>
                Nom de la campagne
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="Ex: Plombiers Paris Q1 2024"
                autoFocus
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 6,
                  border: `1px solid ${C.border}`, fontSize: 14,
                  outline: 'none', background: C.bg,
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
                onKeyPress={e => {
                  if (e.key === 'Enter' && campaignName.trim()) {
                    executeImport();
                  }
                }}
              />
              <div style={{ fontSize: 12, color: C.tx3, marginTop: 6 }}>
                Fichier : {pendingFile?.name}
              </div>
            </div>

            {/* Barre de progression */}
            {importing && (
              <div style={{ marginBottom: 24 }}>
                {/* Debug pour voir l'état */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ fontSize: 10, color: C.red, marginBottom: 8 }}>
                    DEBUG: importing={String(importing)}, progress={importProgress}%, status={importStatus}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.tx2, fontWeight: 500 }}>{importStatus}</span>
                  {importTotal > 0 && (
                    <span style={{ fontSize: 12, color: C.tx3 }}>
                      {importTotal} lignes
                    </span>
                  )}
                </div>
                <div style={{
                  width: '100%', height: 8, borderRadius: 4,
                  background: C.surface2, overflow: 'hidden',
                  border: `1px solid ${C.border}`
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${importProgress}%`,
                    background: `linear-gradient(90deg, ${C.accent} 0%, ${C.accent} 50%, rgba(212, 80, 10, 0.8) 100%)`,
                    transition: 'width 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: importProgress > 0 && importProgress < 100 ? 'shimmer 1.5s infinite' : 'none'
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: C.tx3, marginTop: 4, textAlign: 'center' }}>
                  {importProgress}% {importProgress === 100 && '✅'}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setCampaignModalOpen(false);
                  setCampaignName('');
                  setPendingFile(null);
                  setImportProgress(0);
                  setImportStatus('');
                  setImportTotal(0);
                }}
                disabled={importing}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 6,
                  border: `1px solid ${C.border}`, background: C.surface,
                  color: importing ? C.tx3 : C.tx2, fontWeight: 500, fontSize: 14, 
                  cursor: importing ? 'not-allowed' : 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={executeImport}
                disabled={!campaignName.trim() || importing}
                style={{
                  flex: 2, padding: '10px 0', borderRadius: 6,
                  border: 'none', 
                  background: (!campaignName.trim() || importing) ? C.border : C.accent,
                  color: (!campaignName.trim() || importing) ? C.tx3 : '#fff',
                  fontWeight: 600, fontSize: 14, 
                  cursor: (!campaignName.trim() || importing) ? 'not-allowed' : 'pointer',
                }}
              >
                {importing ? (
                  <span>⏳ {importStatus}</span>
                ) : (
                  <span>🚀 Importer {pendingFile?.name}</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Google Maps Scraping Modal */}
      {scrapingModalOpen && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          }} onClick={closeScrapingModal} />
          <div style={{
            position: 'fixed', top: '10%', left: '50%', transform: 'translate(-50%, 0)',
            background: '#fff', borderRadius: 12, padding: 32, width: '500px', maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 9999,
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: C.tx }}>
              🗺️ Scraper Google Maps Professionnel
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, color: C.tx2, lineHeight: 1.5 }}>
              Scraping automatique d'entreprises depuis Google Maps avec génération intelligente de données
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.tx2, marginBottom: 6 }}>
                Mot-clé (ex: plombier, restaurant, agence marketing)
              </label>
              <input
                type="text"
                value={scrapingKeyword}
                onChange={e => setScrapingKeyword(e.target.value)}
                placeholder="Ex: plombier"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 6,
                  border: `1px solid ${C.border}`, fontSize: 14, outline: 'none',
                  background: C.bg, fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.tx2, marginBottom: 6 }}>
                Emplacement (ex: Paris, Lyon, Marseille)
              </label>
              <input
                type="text"
                value={scrapingLocation}
                onChange={e => setScrapingLocation(e.target.value)}
                placeholder="Ex: Paris"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 6,
                  border: `1px solid ${C.border}`, fontSize: 14, outline: 'none',
                  background: C.bg, fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
              />
            </div>

            {/* Progress */}
            {isScraping && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.tx2, marginBottom: 4 }}>{importStatus}</div>
                <div style={{
                  height: '6px', borderRadius: 3, background: C.border,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${importProgress}%`,
                    background: C.accent,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}
            
            {/* Results Preview */}
            {scrapingResults.length > 0 && !isScraping && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.tx2, marginBottom: 8 }}>
                  📊 Résultats trouvés ({scrapingResults.length})
                </div>
                <div style={{
                  maxHeight: '150px', overflow: 'auto', border: `1px solid ${C.border}`,
                  borderRadius: 6, background: C.bg
                }}>
                  {scrapingResults.map((result, index) => (
                    <div key={index} style={{
                      padding: '8px 12px', borderBottom: index < scrapingResults.length - 1 ? `1px solid ${C.border}` : 'none',
                      fontSize: 12
                    }}>
                      <div style={{ fontWeight: 600, color: C.tx }}>{result.name}</div>
                      <div style={{ color: C.tx2, fontSize: 11 }}>{result.address}</div>
                      <div style={{ color: C.tx2, fontSize: 11 }}>{result.phone} • {result.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={closeScrapingModal}
                disabled={isScraping}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 6,
                  border: `1px solid ${C.border}`, background: '#fff',
                  color: isScraping ? C.tx3 : C.tx2, fontWeight: 500, fontSize: 14,
                  cursor: isScraping ? 'not-allowed' : 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={launchProfessionalScraping}
                disabled={isScraping || !scrapingKeyword || !scrapingLocation}
                style={{
                  flex: 2, padding: '10px 0', borderRadius: 6,
                  border: 'none',
                  background: isScraping || !scrapingKeyword || !scrapingLocation ? C.border : C.accent,
                  color: isScraping || !scrapingKeyword || !scrapingLocation ? C.tx3 : '#fff',
                  fontWeight: 600, fontSize: 14,
                  cursor: isScraping || !scrapingKeyword || !scrapingLocation ? 'not-allowed' : 'pointer',
                }}
              >
                {isScraping ? '⏳ Scraping en cours...' : '🚀 Lancer le scraping automatique'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Google Maps Link Scraping Modal */}
      {linkScrapingModalOpen && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9998,
          }} onClick={closeLinkScrapingModal} />
          <div style={{
            position: 'fixed', top: '10%', left: '50%', transform: 'translate(-50%, 0)',
            background: '#fff', borderRadius: 12, padding: 32, width: '500px', maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 9999,
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: C.tx }}>
              🔗 Scraper Google Maps par Lien
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: 14, color: C.tx2, lineHeight: 1.5 }}>
              Collez un lien Google Maps pour scraper automatiquement les entreprises
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.tx3, marginBottom: 6 }}>
                Lien Google Maps
              </label>
              <input
                placeholder="https://www.google.com/maps/search/..."
                type="url"
                value={scrapingLink}
                onChange={(e) => setScrapingLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  outline: 'none',
                  background: '#F7F6F2',
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
              />
            </div>

            {isScraping && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.tx3, marginBottom: 4 }}>{importStatus}</div>
                <div style={{
                  width: '100%', height: 6, background: C.border, borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: '100%', height: '100%', background: C.accent,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={closeLinkScrapingModal}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  background: '#fff',
                  color: C.tx2,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={launchLinkScraping}
                disabled={isScraping || !scrapingLink}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 6,
                  border: 'none',
                  background: isScraping || !scrapingLink ? C.border : C.accent,
                  color: isScraping || !scrapingLink ? C.tx3 : '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isScraping || !scrapingLink ? 'not-allowed' : 'pointer',
                }}
              >
                {isScraping ? 'Scraping...' : '🔗 Lancer le scraping'}
              </button>
            </div>
          </div>
        </>
      )}

      </div>
  );
}
