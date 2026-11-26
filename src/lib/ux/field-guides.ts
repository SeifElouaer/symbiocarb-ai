// ==============================================================================
// SymbioCarb AI - Centralized UX Field Guides (Labels, Units, Hints, Tooltips)
// Explains every input parameter clearly in plain industrial French so users
// understand its meaning, where to find it, and how it affects calculations.
// ==============================================================================

export interface FieldGuide {
  label: string;
  unit?: string;
  placeholder: string;
  shortHint: string;
  tooltip: string;
  whereToFind?: string;
}

export const FIELD_GUIDES = {
  // ---------------------------------------------------------------------------
  // 1. Profil & Identité de l'Usine
  // ---------------------------------------------------------------------------
  companyName: {
    label: "Raison sociale de l'entreprise",
    placeholder: 'Ex: Société Tunisienne de Profilage SARL',
    shortHint: 'Nom officiel figurant sur les déclarations et rapports d’audit.',
    tooltip:
      "Nom légal de votre site industriel utilisé sur les certificats pré-audit PDF et le fichier XML CBAM transmis à l'importateur européen.",
    whereToFind: 'Registre National des Entreprises (RNE) ou en-tête de facture STEG.',
  },
  fiscalId: {
    label: 'Matricule Fiscal (MF)',
    placeholder: 'Ex: 1234567/A/M/000',
    shortHint: 'Identifiant fiscal tunisien unique de votre établissement.',
    tooltip:
      'Permet d’identifier votre installation de manière unique dans le dossier technique ISO 14064-1 et les exports XML CBAM.',
    whereToFind: 'Patente fiscale ou en-tête de facture commerciale.',
  },
  governorate: {
    label: 'Gouvernorat',
    placeholder: 'Ex: Ben Arous, Sfax, Sousse',
    shortHint: 'Localisation administrative du site industriel.',
    tooltip:
      'Indique le gouvernorat d’implantation du site sur les rapports réglementaires et l’attestation CBAM.',
    whereToFind: 'Adresse du siège d’exploitation ou de l’usine.',
  },
  industrialZone: {
    label: 'Zone industrielle / Adresse',
    placeholder: 'Ex: ZI El Mghira, Lot 42',
    shortHint: 'Zone ou adresse précise du site de production.',
    tooltip:
      'Précise le périmètre géographique exact de l’installation auditée (conforme aux exigences de localisation CBAM).',
    whereToFind: 'Adresse du compteur STEG Moyenne/Haute Tension.',
  },
  sector: {
    label: "Secteur d'activité",
    placeholder: 'Sélectionnez votre secteur',
    shortHint: 'Influence la détection des charges harmoniques réseau (IEEE 519).',
    tooltip:
      "Permet d'adapter les hypothèses techniques (présence de variateurs, fours à induction ou harmoniques réseau en métallurgie) et le diagnostic d'optimisation.",
    whereToFind: 'Code NACE / activité principale de votre usine.',
  },
  contactEmail: {
    label: 'E-mail de contact',
    placeholder: 'Ex: energie@usine.tn',
    shortHint: 'Adresse utilisée pour le suivi et le dossier d’audit.',
    tooltip:
      'Adresse de messagerie du responsable QHSE, énergie ou direction financière en charge du dossier.',
    whereToFind: 'Contact interne responsable de l’audit.',
  },

  // ---------------------------------------------------------------------------
  // 2. Production & Export CBAM
  // ---------------------------------------------------------------------------
  exportCnCode: {
    label: 'Code douanier CN',
    unit: '8 chiffres',
    placeholder: 'Ex: 7209 16 90',
    shortHint: 'Détermine le secteur CBAM, le benchmark UE et la règle Scope 2.',
    tooltip:
      "Code de la Nomenclature Combinée UE à 8 chiffres du produit exporté. Il détermine automatiquement si le produit entre dans le périmètre CBAM, quel benchmark EU ETS s'applique, et si l'électricité (Scope 2) compte (incluse pour ciment/engrais, exclue du SEE CBAM pour acier/aluminium).",
    whereToFind: 'Déclaration en douane (DUM), facture export ou client importateur UE.',
  },
  exportProductName: {
    label: 'Produit principal fabriqué / exporté',
    placeholder: "Ex: Bobines d'acier laminé à froid",
    shortHint: 'Désignation commerciale du bien fini produit par l’usine.',
    tooltip:
      'Intitulé du produit utilisé dans le rapport d’audit CBAM et la communication XML destinée au déclarant européen.',
    whereToFind: 'Catalogue produit ou facture de vente export.',
  },
  annualProductionTons: {
    label: 'Production annuelle totale',
    unit: 'tonnes/an',
    placeholder: 'Ex: 2500',
    shortHint: 'Volume total fabriqué sur l’année (dénominateur du SEE en tCO₂e/t).',
    tooltip:
      "Tonnage total sorti de votre ligne de production sur 12 mois (marché local + export). Cette valeur divise vos émissions totales incorporées pour obtenir le SEE spécifique en tCO₂e par tonne.",
    whereToFind: 'Rapport annuel de production ou ERP usine.',
  },
  annualExportTons: {
    label: "Volume exporté vers l'UE",
    unit: 'tonnes/an',
    placeholder: 'Ex: 1200',
    shortHint: 'Part vendue dans l’UE (≤ production ; si 0, 100 % de la production est prise).',
    tooltip:
      "Tonnage annuel expédié vers l'Union européenne. Il multiplie votre SEE net (après déduction d'allocation gratuite) pour calculer le nombre de certificats CBAM requis. S'il reste à 0 alors qu'une production est renseignée, le moteur évalue par défaut l'exposition sur 100 % de la production annuelle.",
    whereToFind: 'Statistiques commerciales export UE ou bordereaux douaniers annuels.',
  },

  // ---------------------------------------------------------------------------
  // 3. Paramètres CBAM Période Définitive (2026+)
  // ---------------------------------------------------------------------------
  cbamReportingYear: {
    label: 'Année de déclaration CBAM',
    unit: '2026–2034',
    placeholder: '2026',
    shortHint: 'Fixe le taux d’allocation gratuite dégressif UE (97,5 % en 2026 → 0 % en 2034).',
    tooltip:
      "L'année détermine la part d'émissions encore couverte par l'allocation gratuite EU ETS (Règlement UE 2025/2620) : 97,5 % en 2026, puis baisse progressive jusqu'à 0 % en 2034.",
    whereToFind: 'Année civile de l’importation dans l’UE ou horizon de projection souhaité.',
  },
  cbamCertificatePriceEur: {
    label: 'Prix du certificat CBAM',
    unit: '€/tCO₂e',
    placeholder: '85',
    shortHint: 'Cours de référence du quota carbone européen EU ETS.',
    tooltip:
      'Prix unitaire en euros utilisé pour convertir le nombre de certificats CBAM requis en passif financier (€ et TND). Indexé sur les enchères hebdomadaires/trimestrielles EU ETS.',
    whereToFind: 'Cours actuel du marché EU ETS (valeur indicative par défaut : 85 €/tCO₂e).',
  },
  euClientAnnualCbamTonnage: {
    label: 'Tonnage CBAM annuel du client UE',
    unit: 'tonnes/an',
    placeholder: 'Ex: 120',
    shortHint: 'Sert à vérifier le seuil d’exemption de minimis UE de 50 t/an.',
    tooltip:
      "Tonnage total de marchandises CBAM importé sur l'année par votre acheteur européen (tous fournisseurs confondus). En dessous de 50 tonnes/an, le Règlement (UE) 2025/2083 prévoit une exemption de minimis pour cet importateur.",
    whereToFind: 'Estimation annuelle des commandes confirmée par votre client importateur UE.',
  },
  euDefaultSeeOverride: {
    label: 'Valeur par défaut UE (base)',
    unit: 'tCO₂e/t',
    placeholder: 'Ex: 2.10',
    shortHint: 'Valeur de référence UE avant majoration pour comparer avec votre SEE réel.',
    tooltip:
      "Émissions spécifiques par défaut publiées par la Commission européenne (avant la majoration punitive annuelle). Permet de chiffrer l'économie financière générée pour votre client grâce à vos données réelles vérifiées.",
    whereToFind: 'Pré-remplie automatiquement si votre code CN est référencé, sinon modifiable.',
  },

  // ---------------------------------------------------------------------------
  // 4. Combustibles directs Scope 1 (moyenne mensuelle)
  // ---------------------------------------------------------------------------
  naturalGasM3: {
    label: 'Gaz Naturel',
    unit: 'Nm³/mois',
    placeholder: 'Ex: 4500',
    shortHint: 'Consommation mensuelle moyenne de gaz (facteur 2,02 kgCO₂e/Nm³).',
    tooltip:
      'Volume mensuel moyen de gaz naturel brûlé sur site (chaudières, fours, séchoirs). Multiplié par 12 mois puis par 2,02 kgCO₂e/Nm³ pour le Scope 1.',
    whereToFind: 'Facture mensuelle STEG Gaz (volume corrigé en Nm³).',
  },
  heavyFuelTons: {
    label: 'Fuel Lourd',
    unit: 'tonnes/mois',
    placeholder: 'Ex: 12',
    shortHint: 'Consommation mensuelle de fuel n°2 (facteur 3 150 kgCO₂e/tonne).',
    tooltip:
      'Tonnage mensuel moyen de fuel lourd industriel consommé dans les chaudières ou brûleurs. Multiplié par 12 mois et par 3 150 kgCO₂e/t.',
    whereToFind: 'Bons de livraison fournisseur carburant ou registre chaufferie.',
  },
  dieselLiters: {
    label: 'Gasoil / Diesel',
    unit: 'L/mois',
    placeholder: 'Ex: 1800',
    shortHint: 'Carburant des groupes électrogènes et engins (facteur 2,68 kgCO₂e/L).',
    tooltip:
      'Litres mensuels moyens de gasoil consommés par les groupes électrogènes, chariots élévateurs ou brûleurs du site. Multiplié par 12 mois et par 2,68 kgCO₂e/L.',
    whereToFind: 'Bons de cuve interne ou factures carburant site.',
  },

  // ---------------------------------------------------------------------------
  // 5. Matières Premières Scope 3 (BOM)
  // ---------------------------------------------------------------------------
  bomName: {
    label: 'Matière première entrante',
    placeholder: 'Ex: Tôle acier laminé à froid',
    shortHint: 'Nom de l’intrant ou précurseur acheté pour la fabrication.',
    tooltip:
      "Intrant physique transformé dans votre produit fini (ex. billettes d'aluminium, bobines d'acier, clinker, emballage).",
    whereToFind: 'Nomenclature produit (BOM) ou factures fournisseurs.',
  },
  bomCn: {
    label: 'Code CN intrant',
    unit: '8 chiffres',
    placeholder: 'Ex: 7209 16 90',
    shortHint: 'Détecte automatiquement si l’intrant est un précurseur CBAM.',
    tooltip:
      'Code douanier à 8 chiffres de la matière achetée. Les chapitres 72, 73 listés, 76, 2523, 31 et H₂ (2804 10) entrent automatiquement dans le périmètre CBAM ; les autres restent dans le bilan ISO 14064-1 uniquement.',
    whereToFind: 'Facture fournisseur matière première ou nomenclature douanière.',
  },
  bomQty: {
    label: 'Quantité achetée',
    unit: 'tonnes/an',
    placeholder: 'Ex: 850',
    shortHint: 'Masse annuelle totale de cette matière entrante.',
    tooltip:
      'Tonnage annuel consommé de ce précurseur. Multiplié par son facteur d’émission unitaire pour calculer la contribution Scope 3.',
    whereToFind: 'Achats annuels ou suivi stock matières premières.',
  },
  bomEf: {
    label: "Facteur d'émission (FE)",
    unit: 'tCO₂e/t',
    placeholder: 'Ex: 2.45',
    shortHint: 'Attention : saisir en tonnes CO₂e/t (ex. 2,45 acier ; 9,20 alu), pas en kg.',
    tooltip:
      "Émissions incorporées par tonne de matière première achetée, exprimées en tCO₂e par tonne (divisez par 1 000 si votre référentiel affiche des kgCO₂e/t). Exemples : acier laminé à froid = 2,45 ; aluminium extrudé = 9,20.",
    whereToFind: 'Certificat carbone fournisseur ou tableau Référentiel officiel ci-dessous.',
  },

  // ---------------------------------------------------------------------------
  // 6. Facture STEG MT / HT
  // ---------------------------------------------------------------------------
  month: {
    label: 'Mois',
    unit: '1–12',
    placeholder: '1',
    shortHint: 'Mois de facturation STEG (1 à 12).',
    tooltip: 'Numéro du mois correspondant au relevé de consommation STEG saisi.',
    whereToFind: 'En-tête « Période » de votre facture STEG.',
  },
  year: {
    label: 'Année',
    placeholder: '2026',
    shortHint: 'Année de la facture STEG.',
    tooltip: 'Année civile de la facture enregistrée dans votre historique multi-périodes.',
    whereToFind: 'En-tête « Période » de votre facture STEG.',
  },
  districtSteg: {
    label: 'District STEG',
    placeholder: 'Ex: Ben Arous',
    shortHint: 'Agence ou district régional STEG de rattachement.',
    tooltip: 'District STEG indiqué sur la facture pour le suivi administratif du point de livraison.',
    whereToFind: 'Coin supérieur gauche de la facture STEG.',
  },
  tariffRegime: {
    label: 'Régime tarifaire STEG',
    placeholder: 'MT Postes Horaires',
    shortHint: 'Postes Horaires (4 tranches), Uniforme (0,272 TND/kWh) ou HT.',
    tooltip:
      'Détermine la grille de prix appliquée à vos kWh : tarif différencié selon 4 plages horaires (Jour/Pointe/Soir/Nuit) ou tarif Uniforme.',
    whereToFind: 'Ligne « Tarif » ou « Régime » sur votre facture STEG.',
  },
  kwhJour: {
    label: 'Énergie active — Jour',
    unit: 'kWh',
    placeholder: 'Ex: 38000',
    shortHint: 'Tranche de journée (tarif STEG MT : 0,248 TND/kWh).',
    tooltip:
      'Consommation active enregistrée en poste horaire Jour. Sert au calcul du coût STEG, de la puissance active moyenne et des émissions Scope 2.',
    whereToFind: 'Tableau des index / consommations actives sur la facture STEG.',
  },
  kwhPointe: {
    label: 'Énergie active — Pointe',
    unit: 'kWh',
    placeholder: 'Ex: 14500',
    shortHint: 'Tranche la plus chère (0,412 TND/kWh) — cible de l’effacement.',
    tooltip:
      "Consommation en heures de pointe du réseau STEG. C'est la tranche la plus coûteuse (0,412 TND/kWh) et la plus carbonée (turbines de pointe) ; elle sert de base au simulateur de décalage de charge.",
    whereToFind: 'Ligne « Pointe » (ou Pointe été/hiver) sur la facture STEG.',
  },
  kwhSoir: {
    label: 'Énergie active — Soir',
    unit: 'kWh',
    placeholder: 'Ex: 18000',
    shortHint: 'Tranche de soirée (tarif STEG MT : 0,235 TND/kWh).',
    tooltip:
      'Consommation active en poste horaire Soir. Comptabilisée dans la consommation électrique totale et le Scope 2.',
    whereToFind: 'Ligne « Soir » du relevé de consommation STEG.',
  },
  kwhNuit: {
    label: 'Énergie active — Nuit',
    unit: 'kWh',
    placeholder: 'Ex: 22000',
    shortHint: 'Tranche la moins chère (0,188 TND/kWh) — idéale pour le report.',
    tooltip:
      'Consommation en heures creuses de nuit (0,188 TND/kWh). Le report de charges flexibles vers ce créneau économise 0,224 TND/kWh par rapport à la Pointe.',
    whereToFind: 'Ligne « Nuit » du relevé de consommation STEG.',
  },
  pSouscriteKva: {
    label: 'Puissance souscrite',
    unit: 'kVA',
    placeholder: 'Ex: 400',
    shortHint: 'Puissance contractuelle (redevance fixe 3,85 TND/kVA/mois).',
    tooltip:
      'Puissance maximale garantie par votre contrat STEG. Tout dépassement de cette limite par la puissance appelée entraîne une pénalité de 25 TND par kVA dépassé.',
    whereToFind: 'Encadré « Caractéristiques abonnement / Puissance souscrite » de la facture STEG.',
  },
  pMaxAppeleeKva: {
    label: 'Puissance max appelée',
    unit: 'kVA',
    placeholder: 'Ex: 430',
    shortHint: 'Pic maximal atteint ce mois (pénalité 25 TND/kVA si > P. Souscrite).',
    tooltip:
      'Pointe de puissance apparente enregistrée par le compteur sur le mois. Si elle dépasse la puissance souscrite, le moteur calcule le surcoût annuel récupérable.',
    whereToFind: 'Ligne « Puissance maximale appelée » ou « P. Max » sur la facture STEG.',
  },
  kvarhTotal: {
    label: 'Énergie réactive totale',
    unit: 'kVARh',
    placeholder: 'Ex: 68000',
    shortHint: 'Pénalisée par la STEG si elle dépasse 62 % des kWh (tan φ > 0,62).',
    tooltip:
      "Quantité d'énergie réactive consommée sur la période. La STEG autorise jusqu'à 0,62 × kWh total sans pénalité (cos φ ≥ 0,85) ; l'excédent est facturé 0,045 TND/kVARh.",
    whereToFind: 'Ligne « Énergie réactive (kVARh) » sur la facture STEG.',
  },
  cosPhi: {
    label: 'Facteur de puissance (cos φ)',
    unit: '0,50–1,00',
    placeholder: 'Ex: 0.78',
    shortHint: 'Seuil sans pénalité STEG ≥ 0,85 ; zone bonus > 0,92.',
    tooltip:
      'Rapport entre puissance active et puissance apparente (entre 0,50 et 1,00). En dessous de 0,85, la STEG applique des pénalités réactives. Le moteur dimensionne la batterie de condensateurs (kVAR) pour atteindre la cible (0,95).',
    whereToFind: 'Mentionné « cos φ » ou « Facteur de puissance » sur la facture STEG.',
  },
  reactivePenaltyTnd: {
    label: 'Pénalité réactive facturée',
    unit: 'TND/mois',
    placeholder: 'Ex: 1250',
    shortHint: 'Montant mensuel de pénalité cos φ figurant sur la facture.',
    tooltip:
      'Somme mensuelle payée en pénalité d’énergie réactive. Sert de base au calcul des économies annuelles et du temps de retour (payback) du banc de condensateurs.',
    whereToFind: 'Ligne « Pénalité / Majoration énergie réactive » dans le détail tarifaire STEG.',
  },
  totalTtcTnd: {
    label: 'Montant total facture TTC',
    unit: 'TND',
    placeholder: 'Ex: 28500',
    shortHint: 'Net à payer TTC en bas de votre facture STEG mensuelle.',
    tooltip:
      'Montant total toutes taxes comprises (HT + TVA 19 % + FTR + taxe municipale) utilisé comme référence de coût énergétique mensuel.',
    whereToFind: 'Cadre « Net à payer TTC » en bas de la facture STEG.',
  },

  // ---------------------------------------------------------------------------
  // 7. Simulateurs Énergie & Plan d'Action MACC
  // ---------------------------------------------------------------------------
  targetCosPhi: {
    label: 'Facteur de puissance cible (cos φ₂)',
    unit: '0,86–0,99',
    placeholder: '0.95',
    shortHint: 'Objectif visé après compensation (0,95 recommandé pour bonus et pertes Joule).',
    tooltip:
      'Permet de tester la puissance de condensateurs requise Qc = P × (tan φ₁ − tan φ₂), le CAPEX et les économies de pertes Joule selon le cos φ cible choisi.',
  },
  flexibleLoadPct: {
    label: 'Part de charge déplaçable (Pointe → Nuit)',
    unit: '%',
    placeholder: '25',
    shortHint: 'Pourcentage des kWh de Pointe reportables sur le créneau Nuit (0–60 %).',
    tooltip:
      'Part de vos équipements flexibles (broyeurs, groupes froids, pompage, compression) pouvant fonctionner la nuit. Le gain net intègre les coûts sociaux de travail de nuit (Code du Travail tunisien).',
  },
  solarRoofAreaM2: {
    label: 'Surface de toiture solaire disponible',
    unit: 'm²',
    placeholder: 'Ex: 1200',
    shortHint: 'Surface libre exploitable pour des panneaux photovoltaïques en autoconsommation.',
    tooltip:
      'Le dimensionneur PV convertit cette surface en puissance crête installable (kWc), estime la production annuelle en autoconsommation et évalue l’abattement Scope 2 sur votre courbe MACC.',
    whereToFind: 'Plan de masse ou mesure de toiture exploitable des hangars.',
  },
  solarYieldKwhPerKwp: {
    label: 'Productible solaire spécifique',
    unit: 'kWh/kWc/an',
    placeholder: '1650',
    shortHint: 'Production annuelle attendue par kWc en Tunisie (typiquement 1 550–1 750).',
    tooltip:
      'Rendement énergétique annuel d’1 kWc installé selon votre région et l’orientation des toitures (1 650 kWh/kWc/an par défaut en Tunisie).',
    whereToFind: 'Étude de faisabilité PV ou moyenne régionale ANME.',
  },
  solarCapexTndPerKwp: {
    label: 'Coût unitaire installation PV',
    unit: 'TND/kWc',
    placeholder: '2800',
    shortHint: 'Investissement clé en main par kWc installé (avant subvention ANME).',
    tooltip:
      'Coût d’investissement estimé par kWc (modules, onduleurs, structure, pose). Sert au calcul du CAPEX net, du temps de retour et du coût par tCO₂e évitée.',
    whereToFind: 'Devis installateur solaire industriel (2 800 TND/kWc par défaut).',
  },
  alternativeEfTco2ePerTon: {
    label: 'Nouveau FE fournisseur bas-carbone',
    unit: 'tCO₂e/t',
    placeholder: 'Ex: 0.75',
    shortHint: 'Empreinte carbone unitaire du précurseur alternatif (ex. acier recyclé EAF).',
    tooltip:
      "Facteur d'émission du fournisseur alternatif envisagé. S'il est inférieur au facteur actuel de votre intrant BOM, le changement réduit directement vos émissions et votre passif CBAM.",
    whereToFind: 'Fiche EPD ou déclaration carbone vérifiée du fournisseur alternatif.',
  },
  pricePremiumTndPerTon: {
    label: 'Écart de prix achat',
    unit: 'TND/t',
    placeholder: 'Ex: 80',
    shortHint: 'Surcoût (ou économie si négatif) par tonne par rapport au fournisseur actuel.',
    tooltip:
      'Différence de prix d’achat en TND par tonne de matière première. Multipliée par le tonnage annuel pour mesurer l’impact OPEX net face à l’économie CBAM réalisée.',
    whereToFind: 'Offre commerciale comparée au tarif fournisseur actuel.',
  },

  // ---------------------------------------------------------------------------
  // 8. BioClaira — Audit Déchets & Valorisation Circulaire (Pack Gold)
  // ---------------------------------------------------------------------------
  wasteType: {
    label: 'Nature du rejet industriel',
    placeholder: 'Sélectionnez le flux',
    shortHint: 'Détermine les rendements matière/énergie et les filières proposées.',
    tooltip:
      "Type de sous-produit ou déchet organique/industriel généré sur votre site (grignons d'olive, noyaux de dattes, margines, copeaux métalliques ou plastiques).",
    whereToFind: 'Registre interne des déchets ou suivi production.',
  },
  wasteMonthlyTons: {
    label: 'Volume mensuel généré',
    unit: 'tonnes/mois',
    placeholder: 'Ex: 45',
    shortHint: 'Quantité moyenne produite par mois (multipliée par 12 sur l’année).',
    tooltip:
      'Tonnage mensuel brut disponible pour la valorisation. Permet de dimensionner la capacité de l’unité (loi d’échelle CAPEX), les quantités de charbon actif/biochar et les revenus annuels.',
    whereToFind: 'Bons de pesée ou factures d’enlèvement des déchets.',
  },
  moisturePercent: {
    label: "Taux d'humidité",
    unit: '%',
    placeholder: 'Ex: 12 ou 45',
    shortHint: 'Au-delà de 20 %, un pré-séchage thermique (0,85 MWh/t d’eau) est activé.',
    tooltip:
      "Proportion d'eau dans le déchet brut (0 à 95 %). Détermine la matière sèche exploitable et déclenche automatiquement le besoin énergétique et CAPEX d'un séchoir rotatif si l'humidité dépasse 20 %.",
    whereToFind: 'Analyse laboratoire ou valeur usuelle (noyaux ~12 %, grignons ~45 %).',
  },
  disposalCostTndPerTon: {
    label: "Coût actuel d'évacuation / décharge",
    unit: 'TND/tonne',
    placeholder: 'Ex: 35',
    shortHint: 'Coût payé aujourd’hui pour évacuer ou mettre en décharge 1 tonne.',
    tooltip:
      'Frais actuels de transport, traitement ou mise en décharge évités chaque année grâce à la valorisation sur site ou en symbiose industrielle.',
    whereToFind: 'Factures du prestataire de collecte ou frais de transport interne.',
  },
  pyrolysisTemp: {
    label: 'Température de conversion (pyrolyse)',
    unit: '°C',
    placeholder: '650',
    shortHint: 'Plage 450–850 °C (optimal 650–750 °C ; risque de frittage > 780 °C).',
    tooltip:
      'Température du four rotatif de pyrolyse. Augmente la surface spécifique BET jusqu’à ~780 °C, seuil au-delà duquel un frittage réduit la microporosité.',
  },
  activationMethod: {
    label: "Voie d'activation",
    placeholder: 'Voie Chimique',
    shortHint: 'Chimique (H₃PO₄, rendement max + effluents) ou Vapeur (sans effluent acide).',
    tooltip:
      'La voie chimique (H₃PO₄) offre un rendement charbon actif et une surface BET plus élevés mais génère des eaux acides à neutraliser à la chaux (6 m³/t CA). La voie vapeur évite tout effluent acide.',
  },
} as const satisfies Record<string, FieldGuide>;

export type FieldGuideKey = keyof typeof FIELD_GUIDES;
