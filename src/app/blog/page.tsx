'use client';

// ==============================================================================
// SymbioCarb AI - Regulatory Knowledge Hub & Standards Blog
// Trusted, verified industrial references: EU CBAM, ISO 14064, ISO 14067, ISO 50001, ANME
// ==============================================================================

import React, { useState } from 'react';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight, 
  FileText, 
  Download, 
  Sparkles,
  Award,
  Scale,
  Zap,
  Leaf
} from 'lucide-react';

export interface RegulatoryArticle {
  id: string;
  slug: string;
  title: string;
  category: 'CBAM' | 'ISO_STANDARDS' | 'STEG_ANME' | 'CIRCULAR_ECONOMY';
  categoryLabel: string;
  categoryColor: string;
  summary: string;
  readTime: string;
  publishedDate: string;
  officialRef: string;
  sourceUrl: string;
  keyTakeaways: string[];
  fullContent: {
    context: string;
    methodology: string;
    industrialImpact: string;
    formula?: string;
    checklist: string[];
  };
}

const ARTICLES: RegulatoryArticle[] = [
  {
    id: 'cbam-reg-2023-956',
    slug: 'cbam-reglement-ue-2023-956',
    title: 'Règlementation CBAM UE (Règlement UE 2023/956) : Guide Complet pour les Exportateurs Tunisiens',
    category: 'CBAM',
    categoryLabel: 'Règlementation CBAM UE',
    categoryColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    summary: 'Analyse détaillée des obligations déclaratives trimestrielles, de la période transitoire 2023-2025 et du passage aux certificats financiers CBAM payants dès janvier 2026.',
    readTime: '8 min de lecture',
    publishedDate: '15 Janvier 2026',
    officialRef: 'Journal Officiel de l\'Union Européenne L 130/52',
    sourceUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R0956',
    keyTakeaways: [
      'Plus de 70% des exportations industrielles tunisiennes (mécanique, aluminium, engrais, ciment) sont ciblées.',
      'Depuis le 1er janvier 2025, l\'UE interdit les estimations forfaitaires : seules les données réelles vérifiées sont admises.',
      'Les déclarants importateurs européens exigent le format officiel XML standardisé de la Commission Européenne.',
      'Le prix des certificats CBAM sera aligné sur le cours hebdomadaire moyen du quota ETS (actuellement ~85 €/tCO₂e).'
    ],
    fullContent: {
      context: 'Le Mécanisme d\'Ajustement Carbone aux Frontières (MACF / CBAM) a été instauré dans le cadre du Pacte Vert pour l\'Europe ("Fit for 55"). Son objectif est d\'égaliser le coût du carbone entre les industriels européens soumis au système ETS et les exportateurs des pays tiers comme la Tunisie.',
      methodology: 'Les industriels tunisiens doivent déterminer les Émissions Spécifiques Incorporées (SEE - Specific Embedded Emissions) par tonne de produit fini (exprimées en tCO₂e / t). Le calcul doit dissocier les émissions directes (Scope 1 : combustion fossile, réactions chimiques) et les émissions indirectes (Scope 2 : électricité réseau STEG avec facteur certifié de 0.473 kgCO₂e/kWh).',
      formula: 'SEE_{produit} = \\frac{AttrEm_{dir} + AttrEm_{indir}}{TotalProductionTonnes}',
      industrialImpact: 'Sans calcul précis de vos émissions réelles, les douanes de l\'UE appliqueront les "Valeurs par Défaut du JRC" (les 10% les plus polluants de l\'UE majorés d\'une pénalité), imposant une surtaxe artificielle à vos clients européens et pénalisant vos contrats de sous-traitance.',
      checklist: [
        'Identifier les codes douaniers SH à 8 chiffres de tous vos produits exportés vers l\'UE.',
        'Mettre en place un comptage divisionnaire de l\'électricité STEG par ligne de production.',
        'Enregistrer les factures de matières premières avec leurs facteurs d\'émissions certifiés par les fournisseurs.',
        'Générer le rapport trimestriel XML conforme au schéma XSD officiel de la Commission Européenne.'
      ]
    }
  },
  {
    id: 'iso-14064-1-2018',
    slug: 'norme-iso-14064-1-2018-ges',
    title: 'Norme ISO 14064-1:2018 : Spécifications & Déclaration des Émissions GES des Usines',
    category: 'ISO_STANDARDS',
    categoryLabel: 'Normes ISO Carbone',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: 'Le standard international de référence pour structurer le bilan carbone de votre site industriel selon les 3 périmètres (Scope 1, Scope 2 et Scope 3 amont/aval).',
    readTime: '10 min de lecture',
    publishedDate: '10 Février 2026',
    officialRef: 'International Organization for Standardization (ISO 14064-1:2018)',
    sourceUrl: 'https://www.iso.org/fr/standard/66453.html',
    keyTakeaways: [
      'Cadre universellement reconnu par les auditeurs tiers accrédités (TÜV, Bureau Veritas, SGS).',
      'Exige le respect de 5 principes fondamentaux : pertinence, exhaustivité, cohérence, exactitude et transparence.',
      'Indispensable pour attester de la crédibilité des données transmises pour le CBAM européen.',
      'Permet d\'identifier les postes de combustion et de consommation électrique les plus rentables à décarboner.'
    ],
    fullContent: {
      context: 'La norme ISO 14064-1 spécifie les principes et exigences pour la quantification et la rédaction des rapports sur les émissions et suppressions de gaz à effet de serre (GES) au niveau des organismes.',
      methodology: 'La quantification repose sur l\'équation fondamentale : Émission (tCO₂e) = Donnée d\'activité × Facteur d\'émission. Pour la Tunisie, les données d\'activité proviennent des factures STEG MT (kWh), des consommations de gaz naturel / fioul (Nm³ ou tonnes) et des achats de matières.',
      formula: 'GES_{Total} = \\sum (Activité_i \\times FE_i) \\times (1 - Taux_{Incertitude})',
      industrialImpact: 'Disposer d\'un inventaire conforme ISO 14064-1 réduit le temps d\'audit externe de 60% et confère un avantage concurrentiel majeur lors des appels d\'offres de donneurs d\'ordres européens (automobiles, aéronautiques, agroalimentaires).',
      checklist: [
        'Définir le périmètre organisationnel (approche du contrôle opérationnel ou de la part financière).',
        'Classifier les émissions : Directes (Scope 1), Énergie indirecte (Scope 2), Autres indirectes (Scope 3).',
        'Quantifier l\'incertitude des mesures et des facteurs d\'émissions utilisés.',
        'Rédiger le rapport d\'inventaire annuel GES certifié par le responsable QHSE / Énergie.'
      ]
    }
  },
  {
    id: 'iso-50001-steg-audit',
    slug: 'iso-50001-audit-steg-tunisie',
    title: 'Norme ISO 50001 & Cadre STEG MT/HT : Optimisation des Tarifs & Audits Obligatoires en Tunisie',
    category: 'STEG_ANME',
    categoryLabel: 'Efficacité Énergétique & STEG',
    categoryColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    summary: 'Guide opérationnel sur la réglementation tunisienne de l\'énergie : audits obligatoires pour consommateurs > 500 TEP, élimination des pénalités cos phi et effacement des pointes tarifaires.',
    readTime: '7 min de lecture',
    publishedDate: '22 Janvier 2026',
    officialRef: 'Loi n° 2004-72 & Arrêté Tarifaire STEG MT / HT',
    sourceUrl: 'http://www.anme.tn/cadre-reglementaire/loi-relative-a-la-maitrise-de-lenergie',
    keyTakeaways: [
      'En Tunisie, tout établissement industriel consommant plus de 500 TEP/an est soumis à un audit énergétique obligatoire tous les 5 ans.',
      'Le tarif STEG Moyenne Tension en heures de pointe (0.412 TND/kWh) est 119% plus cher que le tarif de nuit (0.188 TND/kWh).',
      'Un facteur de puissance cos φ < 0.80 entraîne des pénalités financières mensuelles directes sur votre facture.',
      'L\'installation d\'un banc de condensateurs dimensionné avec inductance anti-harmonique se rentabilise en moins de 10 mois.'
    ],
    fullContent: {
      context: 'Face à la hausse des coûts énergétiques et aux contraintes du réseau national, l\'État tunisien et l\'ANME imposent une gestion rationnelle de l\'énergie aux consommateurs industriels raccordés en Moyenne et Haute Tension.',
      methodology: 'L\'optimisation combine deux leviers mathématiques : 1) La compensation de l\'énergie réactive par condensateurs : Qc = P × (tan φ1 - tan φ2), et 2) L\'effacement des charges flexibles hors de la fenêtre de pointe STEG (18h-21h en hiver, 19h-22h en été).',
      formula: 'Q_c = P_{active} \\times (\\tan(\\arccos(\\cos \\varphi_{actuel})) - \\tan(\\arccos(0.95)))',
      industrialImpact: 'Une usine de mécanique moyenne à Ben Arous ou une huilerie à Sfax économise entre 25 000 et 85 000 TND par an rien qu\'en neutralisant les pénalités STEG et en décalant 25% de ses charges motrices vers le tarif nuit.',
      checklist: [
        'Vérifier la date d\'échéance du dernier audit énergétique obligatoire déposé à l\'ANME.',
        'Calculer le cos φ moyen de vos 12 dernières factures STEG MT.',
        'Installer une batterie de condensateurs automatique à gradins avec réactances de désaccordage 189 Hz.',
        'Reprogrammer les opérations de broyage, pompage ou fours thermiques en dehors de la plage de pointe.'
      ]
    }
  },
  {
    id: 'anme-fte-subventions',
    slug: 'anme-fonds-transition-energetique-subventions',
    title: 'Subventions ANME (Fonds de Transition Énergétique - FTE) : 70% de Prise en Charge des Audits',
    category: 'STEG_ANME',
    categoryLabel: 'Aides Financières & Subventions',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: 'Comment mobiliser le FTE et le mécanisme FODEP pour financer 70% de votre diagnostic carbone et bénéficier des primes d\'investissement pour le solaire MT.',
    readTime: '6 min de lecture',
    publishedDate: '02 Février 2026',
    officialRef: 'Décret gouvernemental n° 2017-983 régissant le FTE',
    sourceUrl: 'http://www.anme.tn/financement/fonds-de-transition-energetique',
    keyTakeaways: [
      'Prise en charge jusqu\'à 70% du coût de l\'audit énergétique avec un plafond de 30 000 TND.',
      'Prime d\'investissement de 20% à 30% du coût des équipements d\'efficacité énergétique (variateurs de vitesse, condensateurs).',
      'Prime pour les installations solaires photovoltaïques en autoproduction industrielle raccordées au réseau MT.',
      'SymbioCarb AI génère automatiquement les fiches techniques requises pour le guichet unique de l\'ANME.'
    ],
    fullContent: {
      context: 'Le Fonds de Transition Énergétique (FTE) est l\'instrument financier de la politique énergétique tunisienne. Il octroie des subventions directes à fonds perdus et des crédits bonifiés aux PME industrielles.',
      methodology: 'Pour être éligible, l\'entreprise doit mandater un expert auditeur agréé par l\'ANME et soumettre un plan d\'actions chiffré démontrant le gain en TEP (Tonnes Équivalent Pétrole) et en tonnes de CO₂ évitées.',
      industrialImpact: 'Pour un investissement de 50 000 TND dans un banc de condensateurs et des variateurs, l\'ANME peut rembourser jusqu\'à 15 000 TND, ramenant le temps de retour sur investissement réel à moins de 8 mois.',
      checklist: [
        'Télécharger le formulaire de demande préalable d\'aide au diagnostic sur le portail ANME.',
        'Joindre les 12 dernières factures STEG MT acquittées et le bilan d\'exploitation de l\'usine.',
        'Soumettre l\'étude technico-économique générée par SymbioCarb AI avant toute commande d\'équipements.'
      ]
    }
  },
  {
    id: 'bioclaira-pyrolyse-dechets',
    slug: 'bioclaira-pyrolyse-dattes-grignons-charbon-actif',
    title: 'Modèles BioClaira : Valorisation Thermochimique des Noyaux de Dattes & Grignons d\'Olive',
    category: 'CIRCULAR_ECONOMY',
    categoryLabel: 'Économie Circulaire & Symbiose',
    categoryColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    summary: 'Étude des cinétiques de pyrolyse et d\'activation chimique pour transformer les résidus agro-industriels tunisiens en charbon actif à haute valeur ajoutée et biochar séquestrateur de carbone.',
    readTime: '9 min de lecture',
    publishedDate: '18 Février 2026',
    officialRef: 'Projet National de Valorisation de la Biomasse & Modèles BioClaira',
    sourceUrl: 'https://symbiocarb.vercel.app/symbiosis',
    keyTakeaways: [
      'La Tunisie génère plus de 45 000 tonnes de noyaux de dattes et 350 000 tonnes de grignons d\'olive par an.',
      'La pyrolyse contrôlée à 750°C avec activation à la vapeur d\'eau génère un charbon actif d\'une surface BET > 1250 m²/g.',
      'Valeur marchande locale du charbon actif pour traitement de l\'eau et décoloration : 3 800 à 4 500 TND / tonne.',
      'Chaque tonne de résidus valorisée évite l\'émission de 0.85 tCO₂e de méthane par décomposition anarchique.'
    ],
    fullContent: {
      context: 'Les agro-industries du Sud et du Centre tunisien (Djérid, Sfax, Sahel) font face à un coût d\'élimination élevé de leurs déchets organiques solides. Les modèles BioClaira permettent de simuler avec rigueur leur transformation en adsorbant industriel ou en bio-combustible.',
      methodology: 'Le modèle cinétique calcule les rendements massiques (charbon solide : 32%, bio-huile : 45%, gaz de synthèse : 23%), la consommation thermique de séchage préalable et le bilan carbone net évitant les émissions fossiles.',
      formula: 'Rendement_{Charbon} = Rendement_{Base} \\times e^{-k(T - T_0)} \\times (1 - Humidité)',
      industrialImpact: 'Une station de conditionnement de dattes à Tozeur valorisant 2 000 tonnes de noyaux dégage un profit net annuel estimé à plus de 210 000 TND tout en réduisant son empreinte carbone de 1 700 tCO₂e.',
      checklist: [
        'Mesurer le taux d\'humidité moyen des résidus à la sortie du procédé de lavage/broyage (< 15% requis).',
        'Réaliser une analyse granulométrique des noyaux concassés.',
        'Identifier les preneurs industriels locaux (stations d\'épuration ONAS, usines chimiques de Gabès).',
        'Consulter la bourse des déchets de SymbioCarb AI pour géolocaliser les partenariats territoriaux.'
      ]
    }
  },
  {
    id: 'iso-14067-cfp-produit',
    slug: 'norme-iso-14067-empreinte-carbone-produits',
    title: 'Norme ISO 14067 : Empreinte Carbone des Produits (CFP) & Analyse du Cycle de Vie',
    category: 'ISO_STANDARDS',
    categoryLabel: 'Normes ISO Carbone',
    categoryColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    summary: 'Règles méthodologiques de l\'ACV berceau-à-la-porte pour certifier l\'empreinte unitaire de chaque produit manufacturé exporté vers le marché européen.',
    readTime: '8 min de lecture',
    publishedDate: '26 Janvier 2026',
    officialRef: 'ISO 14067:2018 Gaz à effet de serre — Empreinte carbone des produits',
    sourceUrl: 'https://www.iso.org/fr/standard/71206.html',
    keyTakeaways: [
      'Spécifie les règles de calcul de l\'empreinte carbone par unité fonctionnelle (ex: 1 kg de câble, 1 pièce mécanique usinée).',
      'Assure la traçabilité complète de l\'extraction des matières premières jusqu\'à la sortie de l\'usine.',
      'Sert de base technique pour les Déclarations Environnementales de Produits (EPD).',
      'Directement articulée avec les exigences de la directive européenne CSRD et du règlement CBAM.'
    ],
    fullContent: {
      context: 'Alors que l\'ISO 14064 s\'applique à l\'usine dans son ensemble, l\'ISO 14067 calcule l\'impact carbone spécifique d\'une référence produit donnée (BOM - Bill of Materials).',
      methodology: 'L\'inventaire du cycle de vie collecte les flux entrants de matières, les énergies consommées à chaque étape d\'usinage/assemblage et les déchets générés, puis applique les facteurs d\'émission validés.',
      formula: 'CFP = \\sum (Masse_{matériau, i} \\times FE_{amont, i}) + (Énergie_{process} \\times FE_{steg})',
      industrialImpact: 'Permet de fournir aux acheteurs européens des rapports carbone transparents et certifiés, protégeant vos marges contre les renégociations tarifaires liées au climat.',
      checklist: [
        'Établir la nomenclature complète (BOM) avec poids unitaire exact de chaque composant.',
        'Associer chaque ligne d\'achat à un facteur d\'émission issu de la base ADEME ou du JRC.',
        'Calculer l\'énergie moyenne consommée par cycle de fabrication.',
        'Éditer la fiche de déclaration de conformité CFP certifiée.'
      ]
    }
  }
];

export default function BlogPage() {
  const { t, locale } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<RegulatoryArticle | null>(null);

  const categories = [
    { id: 'ALL', label: 'Toutes les Références' },
    { id: 'CBAM', label: 'Règlementation CBAM UE' },
    { id: 'ISO_STANDARDS', label: 'Normes ISO (14064 & 14067)' },
    { id: 'STEG_ANME', label: 'Énergie STEG & ANME' },
    { id: 'CIRCULAR_ECONOMY', label: 'Économie Circulaire & BioClaira' },
  ];

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === 'ALL' || art.category === selectedCategory;
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.officialRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Module Description Header */}
      <SectionHeader
        title="Centre Réglementaire & Base de Connaissances"
        badge="Références Officielles"
        badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
        objective="Fournir aux industriels, ingénieurs et auditeurs tunisiens les textes réglementaires authentiques, formules de calcul homologuées et guides de certification pour le CBAM européen, les normes ISO et les subventions ANME."
        inputs={[
          'Codes douaniers SH de vos produits',
          'Factures STEG Moyenne/Haute Tension',
          'Réglementations EUR-Lex et décrets ANME'
        ]}
        deliverables={[
          'Guides d\'audit ISO 14064-1 & 14067',
          'Formules de calcul déterministes du SEE',
          'Procédures de subvention ANME FTE 70%',
          'Sources officielles vérifiées et liens légaux'
        ]}
        regulation="Règlement (UE) 2023/956, ISO 14064-1:2018, ISO 50001, Loi tunisienne 2004-72 & Décret FTE 2017-983"
      />

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-black shadow-sm font-bold'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-card-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une norme, CBAM, STEG..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-card-border bg-card ps-9 pe-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            onClick={() => setActiveArticle(article)}
            className="group rounded-2xl glass-panel-elevated p-5 border border-card-border hover:border-emerald-500/40 transition-all flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Category & Read Time */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${article.categoryColor}`}>
                  {article.categoryLabel}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-2">
                {article.title}
              </h2>

              {/* Summary */}
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                {article.summary}
              </p>

              {/* Official Reference Stamp */}
              <div className="rounded-lg bg-card/60 p-2 border border-card-border flex items-center gap-2 text-[10px] text-muted-foreground">
                <Scale className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate font-mono">{article.officialRef}</span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3 border-t border-card-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {article.publishedDate}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">
                <span>Lire l'analyse</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="rounded-2xl glass-panel p-12 text-center text-muted-foreground space-y-2">
          <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/60" />
          <p className="text-sm font-medium">Aucun article ne correspond à votre recherche.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
            className="text-xs text-emerald-400 font-semibold underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveArticle(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl glass-panel-elevated p-6 sm:p-8 border border-white/15 dark:border-white/10 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-card-border pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${activeArticle.categoryColor}`}>
                    {activeArticle.categoryLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{activeArticle.readTime}</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  {activeArticle.title}
                </h1>
                <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Référence officielle : {activeArticle.officialRef}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Key Takeaways Box */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
              <h2 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Points Clés pour l'Industrie</span>
              </h2>
              <ul className="text-xs text-foreground/90 space-y-1.5 ps-1">
                {activeArticle.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Article Body Sections */}
            <div className="space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Contexte & Enjeux Industriels
                </h2>
                <p>{activeArticle.fullContent.context}</p>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Méthodologie Déterministe de Calcul
                </h2>
                <p>{activeArticle.fullContent.methodology}</p>
              </div>

              {activeArticle.fullContent.formula && (
                <div className="rounded-xl bg-card p-3 border border-card-border font-mono text-center text-xs sm:text-sm text-emerald-400">
                  {activeArticle.fullContent.formula}
                </div>
              )}

              <div className="space-y-1.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Impact Économique & Risques d'Audit
                </h2>
                <p>{activeArticle.fullContent.industrialImpact}</p>
              </div>

              <div className="space-y-2 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  4. Checklist de Conformité Usine
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeArticle.fullContent.checklist.map((item, idx) => (
                    <div key={idx} className="rounded-lg border border-card-border bg-card/60 p-2.5 flex items-start gap-2 text-xs">
                      <span className="font-mono text-emerald-400 font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer with External Source Link */}
            <div className="pt-4 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">
                Document mis à jour selon les derniers décrets et textes de l'UE et de l'ANME.
              </span>
              <a
                href={activeArticle.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 py-2 px-4 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-sm"
              >
                <span>Consulter le Texte Officiel</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

