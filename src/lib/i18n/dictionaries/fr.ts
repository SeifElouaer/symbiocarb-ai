// ==============================================================================
// French Dictionary (Français Technique & Réglementaire STEG / ANME / CBAM)
// ==============================================================================

export const fr = {
  // Brand & Global
  appName: 'SymbioCarb AI',
  tagline: 'Intelligence Carbone, Énergie STEG & Symbiose Industrielle pour l\'Industrie Tunisienne',
  
  // Navigation
  nav: {
    dashboard: 'Cockpit Industriel',
    energy: 'Énergie STEG & Subventions',
    cbam: 'Conformité CBAM & ISO 14064',
    symbiosis: 'Symbiose & BioClaira',
    ocr: 'Document AI Factures',
    copilot: 'DarjaBot Terrain',
    switchPersona: 'Changer d\'usine démo',
    activePersona: 'Usine Active',
  },

  // Personas
  personas: {
    sfax: {
      name: 'Huilerie & Agro-Industrie de Sfax',
      desc: 'Saison oléicole intense, pointe STEG & valorisation grignons/margines',
      location: 'Sfax Thyna - Route de Gabès',
    },
    tozeur: {
      name: 'Société Saharienne de Dattes & BioClaira',
      desc: 'Chambres froides 24/7 & 600t noyaux convertis en Charbon Actif',
      location: 'Zone Industrielle Tozeur',
    },
    benarous: {
      name: 'Mécanique & Composants Ben Arous',
      desc: 'Pénalités cos φ = 0.74 & déclaration douanière CBAM UE acier/alu',
      location: 'Zone Industrielle El Mghira',
    },
  },

  // Dashboard Cockpit
  cockpit: {
    title: 'Cockpit Industriel & Décarbonation',
    subtitle: 'Vue d\'ensemble temps réel des flux énergétiques, carbone et opportunités de valorisation circulaire',
    kpiCarbonFootprint: 'Empreinte Carbone Totale',
    kpiStegBill: 'Facture STEG Mensuelle',
    kpiSymbiosisRevenue: 'Gains Symbiose Circulaire',
    kpiCbamLiability: 'Exposition Taxe CBAM UE',
    unitTco2e: 'tCO₂e / an',
    unitTnd: 'TND',
    unitTndYear: 'TND / an',
    unitEur: '€',
    
    // Quick alerts
    alertPointeTitle: 'Alerte Dépassement Tarif Pointe STEG',
    alertPointeMsg: 'Tarif de pointe actif (0.412 TND/kWh). Déclenchez l\'effacement de 45 kW pour économiser 140 TND ce soir.',
    alertCosPhiTitle: 'Pénalité Énergie Réactive Élevée (cos φ = 0.748)',
    alertCosPhiMsg: '3,845 TND de pénalités ce mois. L\'installation d\'une batterie de 150 kVAR est amortie en 4.2 mois.',
    alertSymbiosisTitle: 'Nouvelle Synergie Détectée',
    alertSymbiosisMsg: 'Un acheteur à Sfax Thyna recherche 180t de charbon actif pour traitement d\'eau.',
    
    // Charts
    chartLoadTitle: 'Courbe de Charge STEG Moyenne Tension (kWh par poste)',
    chartSankeyTitle: 'Diagramme de Flux Matière & Énergie (Sankey Circulaire)',
  },

  // Energy & STEG Module
  energy: {
    title: 'Optimisation STEG & Subventions ANME',
    subtitle: 'Simulateur déterministe de tarification MT, compensation réactive cos φ et subventions FTE',
    loadTitle: 'Répartition de la Consommation MT (Postes Horaires)',
    jour: 'Jour (07h-19h)',
    pointe: 'Pointe (19h-22h)',
    soir: 'Soir (22h-24h)',
    nuit: 'Nuit (00h-07h)',
    puissanceSouscrite: 'Puissance Souscrite',
    puissanceMax: 'Puissance Maximale Appelée',
    depassement: 'Dépassement de Puissance',
    cosPhiCurrent: 'Facteur de Puissance Actuel (cos φ)',
    cosPhiTarget: 'Cible Recommandée (cos φ = 0.95)',
    redevanceReactive: 'Pénalité Réactive Mensuelle',
    qcRequired: 'Batterie de Condensateurs Requise',
    annualSavings: 'Économie Annuelle Totale',
    paybackMonths: 'Période d\'Amortissement',
    anmeSubsidiesTitle: 'Subventions Énergétiques Éligibles (ANME / FODEP)',
    anmeAuditGrant: 'Subvention Audit Énergétique FTE (70% plafonné à 30 000 TND)',
    anmeEquipGrant: 'Prime d\'Investissement Efficacité Énergétique (20%)',
    fodepGrant: 'Fonds de Dépollution FODEP (20% à 30%)',
    eligible: 'Éligible immédiatement',
    loadShiftTitle: 'Simulateur d\'Effacement & Déplacement de Charge',
    loadShiftDesc: 'Déplacez des charges flexibles du poste Pointe vers le poste Nuit pour réduire la facture.',
    shiftPercent: 'Part des charges déplaçables',
  },

  // CBAM Module
  cbam: {
    title: 'Passeport Carbone & Conformité CBAM UE (MACF)',
    subtitle: 'Calcul déterministe des émissions spécifiques incorporées (SEE) selon le Règlement (UE) 2023/956',
    seeTitle: 'Émissions Spécifiques Incorporées (SEE)',
    benchmarkComparison: 'Écart au Benchmark Européen',
    taxExposureTitle: 'Exposition Fiscale Prévisionnelle CBAM',
    scope1: 'Scope 1 (Émissions directes procédé)',
    scope2: 'Scope 2 (Électricité réseau STEG)',
    scope3: 'Scope 3 (Précurseurs métalliques & intrants)',
    bomTitle: 'Nomenclature Industrielle & Facteurs d\'Émission (BOM)',
    uploadBom: 'Importer une Nomenclature (Excel/CSV)',
    ragStatus: 'Vector RAG sémantique (768 dimensions) actif',
    exportXml: 'Télécharger Déclaration CBAM (XML Officiel UE)',
    exportPdf: 'Télécharger Rapport d\'Audit ISO 14064-1 (PDF)',
  },

  // Symbiosis & BioClaira Module
  symbiosis: {
    title: 'Symbiose Industrielle & Modèles BioClaira',
    subtitle: 'Valorisation thermochimique des déchets agro-industriels tunisiens (Noyaux de dattes & Grignons)',
    bioclairaModelTitle: 'Simulateur Cinétique BioClaira (Pyrolyse & Activation)',
    rawBiomass: 'Biomasse Brute Annuelle',
    moisture: 'Humidité Initiale',
    pyrolysisTemp: 'Température de Pyrolyse',
    activationType: 'Type d\'Activation',
    steam: 'Vapeur d\'eau (Physique)',
    chemicalH3po4: 'Acide Phosphorique H₃PO₄ (Chimique)',
    chemicalKoh: 'Potasse KOH (Ultra-microporeuse)',
    outputsTitle: 'Rendements Déterministes & Produits Produits',
    activatedCarbon: 'Charbon Actif Produit',
    biochar: 'Biochar Amendement de Sol',
    betSurface: 'Surface Spécifique BET Estimée',
    iodineNumber: 'Indice d\'Iode',
    annualProfit: 'Bénéfice Net Annuel Estimé',
    avoidedCo2: 'Émissions CO₂e Net Évitées',
    mapTitle: 'Cartographie Géospatiale 3D des Synergies en Tunisie',
    filterGovernorate: 'Gouvernorat',
    filterAll: 'Tous les gouvernorats',
  },

  // Document AI / OCR Module
  ocr: {
    title: 'Document AI : Factures STEG & Nomenclatures',
    subtitle: 'Extraction multimodale instantanée via Gemini 2.5 Flash Vision avec vérification interactive',
    dropzoneTitle: 'Glissez-déposez une facture STEG (PDF ou photo smartphone)',
    dropzoneDesc: 'Compatible MT Postes Horaires, MT Uniforme et bordereaux SONEDE',
    sampleButton: 'Charger un échantillon de facture STEG MT',
    extracting: 'Analyse multimodale Gemini en cours...',
    extractedFields: 'Données Extraites & Niveaux de Confiance',
    saveToDb: 'Valider et Synchroniser avec la Base de Données',
  },

  // Telegram Copilot (DarjaBot)
  copilot: {
    title: 'DarjaBot - Copilot Terrain en Darija Tunisienne',
    subtitle: 'Assistant shop-floor connecté en temps réel via l\'API officielle Telegram & reconnaissance vocale',
    simulatorTitle: 'Simulateur Mobile Atelier (DarjaBot)',
    onlineStatus: 'En ligne (Synchronisé avec le bot Telegram)',
    pushToPhone: 'Envoyer une alerte test sur mon téléphone Telegram',
    syncUpdates: 'Synchroniser derniers messages (getUpdates)',
    sendPlaceholder: 'Écrivez en Darija (العربية ou Arabizi) ou en Français...',
    micListening: 'Écoute en cours...',
    presetsTitle: 'Commandes Rapides Atelier :',
    preset1: '⚠️ Alerte STEG Pointe (تنبيه ذروة الستاغ)',
    preset2: '⚡ Analyse cos φ (تحليل معامل القدرة)',
    preset3: '🌿 Valorisation Noyaux (تثمين نوى التمور)',
  },
};

