// ==============================================================================
// SymbioCarb AI - Domain TypeScript Definitions
// ==============================================================================

export type Locale = 'fr' | 'en' | 'ar-TN';

export type Sector = 
  | 'agro_industry'
  | 'metal_mechanics'
  | 'date_processing'
  | 'olive_oil'
  | 'textile'
  | 'chemicals';

export type StegTariffType = 'MT_POSTES_HORAIRES' | 'MT_UNIFORME' | 'HT';

export interface Organization {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  sector: Sector;
  governorate: string;
  industrial_zone: string;
  latitude: number;
  longitude: number;
  cbam_exposed: boolean;
  steg_tariff_type: StegTariffType;
  preferred_locale: Locale;
  contact_phone?: string;
  contact_email?: string;
}

export interface UtilityBill {
  id: string;
  org_id: string;
  billing_month: number;
  billing_year: number;
  tariff_regime: StegTariffType;
  district_steg: string;
  kwh_jour: number;
  kwh_pointe: number;
  kwh_soir: number;
  kwh_nuit: number;
  kwh_total: number;
  kvarh_total: number;
  cos_phi: number;
  tan_phi: number;
  reactive_penalty_tnd: number;
  p_souscrite_kva: number;
  p_max_appelee_kva: number;
  power_overrun_penalty_tnd: number;
  total_ht_tnd: number;
  tva_tnd: number;
  municipal_taxes_tnd: number;
  ftr_tnd: number;
  total_ttc_tnd: number;
  is_verified: boolean;
  raw_file_url?: string;
  extracted_json?: Record<string, unknown>;
}

export interface EmissionFactor {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  category: 'electricity_grid' | 'combustion' | 'raw_materials' | 'freight' | 'bio_waste';
  cn_code_8?: string;
  unit: string;
  ef_kgco2e_per_unit: number;
  scope: 1 | 2 | 3;
  source_authority: string;
  description?: string;
  similarity?: number;
}

export interface BomEntry {
  id: string;
  org_id: string;
  raw_description: string;
  quantity: number;
  unit: string;
  matched_ef_id?: string;
  matched_ef?: EmissionFactor;
  similarity_score?: number;
  scope: 1 | 2 | 3;
  total_tco2e: number;
}

export interface WasteListing {
  id: string;
  org_id: string;
  waste_type: 'date_pits' | 'olive_pomace' | 'margines' | 'metal_shavings' | 'textile_scraps' | 'hdpe_plastic';
  title_fr: string;
  title_en: string;
  title_ar: string;
  annual_tonnage: number;
  moisture_pct: number;
  current_disposal_method: string;
  current_disposal_cost_tnd: number;
  bioclaira_model: string;
  potential_annual_revenue_tnd: number;
  avoided_tco2e_per_year: number;
  status: 'available' | 'matched' | 'contracted';
}

export interface SymbiosisMatch {
  id: string;
  producer_org_id: string;
  consumer_org_id: string;
  producer_name?: string;
  consumer_name?: string;
  waste_listing_id: string;
  waste_title?: string;
  road_distance_km: number;
  transport_cost_tnd: number;
  net_economic_gain_tnd: number;
  net_tco2e_saved: number;
  match_score: number;
  status: 'suggested' | 'in_discussion' | 'active';
}

export interface TelegramLog {
  id: string;
  org_id?: string;
  telegram_chat_id: string;
  telegram_update_id?: number;
  direction: 'inbound' | 'outbound';
  media_type: 'text' | 'voice' | 'photo' | 'document';
  raw_text: string;
  translated_text?: string;
  detected_locale: Locale;
  extracted_action_json?: Record<string, unknown>;
  delivery_status: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// Deterministic Solvers Output Types
// ------------------------------------------------------------------------------

export interface StegTariffResult {
  baseCostTnd: number;
  costJourTnd: number;
  costPointeTnd: number;
  costSoirTnd: number;
  costNuitTnd: number;
  redevancePuissanceTnd: number;
  overrunPenaltyTnd: number;
  reactivePenaltyTnd: number;
  ftrTnd: number;
  municipalTaxTnd: number;
  tvaTnd: number;
  totalTtcTnd: number;
  co2Tons: number;
  isBalanceValid: boolean;
  balanceDiscrepancyKwh: number;
  tariffRegime?: StegTariffType;
}

export interface CosPhiResult {
  currentCosPhi: number;
  targetCosPhi: number;
  currentTanPhi: number;
  targetTanPhi: number;
  requiredQcKvar: number;
  nominalQcWithDeratingKvar: number;
  ambientDeratingFactor: number;
  thdUPercent: number;
  thdIPercent: number;
  harmonicOrderRisk: string;
  annualPenaltySavedTnd: number;
  jouleLossesReducedKwh: number;
  jouleSavingsTnd: number;
  totalAnnualGainTnd: number;
  estimatedCapexTnd: number;
  paybackPeriodMonths: number;
  resonanceRiskWarning: boolean;
  antiHarmonicReactorRecommended: boolean;
}

export interface BioClairaSimulationResult {
  wasteType: string;
  rawTonnage: number;
  moisturePct: number;
  dryTonnage: number;
  pyrolysisTempC: number;
  activationMethod: string;
  
  // Outputs
  activatedCarbonYieldPct: number;
  activatedCarbonTons: number;
  biocharTons: number;
  syngasBioOilMwh: number;
  estimatedBetSurfaceAreaM2g: number;
  iodineNumberMgG: number;
  poreSinteringWarning: boolean;
  
  // Process Engineering & Effluents
  requiresPreDrying: boolean;
  dryingThermalMwh: number;
  acidEffluentVolumeM3: number;
  effluentTreatmentCostTnd: number;
  transportEmissionsTco2e: number;

  // Financials, CAPEX & Discounted Metrics
  grossMarketValueTnd: number;
  marketPricePerTonTnd: number;
  estimatedAnnualOpexTnd: number;
  netAnnualProfitTnd: number;
  totalCapexTnd: number;
  anmeSubsidizedCapexTnd: number;
  npv7YearsTnd: number;
  irrPercent: number;
  paybackYears: number;

  // Carbon Accounting
  avoidedMethaneTco2e: number;
  substitutedFossilCarbonTco2e: number;
  netAvoidedTco2e: number;
}

export interface CbamCalculationResult {
  productName: string;
  cnCode8: string;
  finishedProductTons: number;
  scope1DirectTco2e: number;
  scope2IndirectTco2e: number;
  scope3PrecursorsTco2e: number;
  totalEmbeddedTco2e: number;
  specificEmbeddedEmissionsTco2ePerTon: number; // SEE
  euEtsCarbonPriceEur: number;
  estimatedCbamTaxLiabilityEur: number;
  estimatedCbamTaxLiabilityTnd: number;
  freeAllocationBenchmarkGap: number;
  verificationStatus: 'PRE_AUDIT_DRAFT' | 'VERIFIER_REVIEW' | 'ACCREDITED_CERTIFIED';
  accreditationBodyId: string;
  auditIntegrityHash: string;
  regulatoryDisclaimer: string;
  gridEmissionSource: string;
}

export interface LoadShiftingResult {
  shiftedKwhFromPointe: number;
  monthlyBillSavingsTnd: number;
  annualBillSavingsTnd: number;
  avoidedGridCarbonKg: number;
  newPointeLoadKwh: number;
  additionalLaborNightCostTnd: number;
  nightTransportCostTnd: number;
  netTrueMonthlyGainTnd: number;
  netTrueAnnualGainTnd: number;
  isEconomicallyViable: boolean;
  hrFeasibilityNote: string;
}

export interface ComplianceNotice {
  inpdpNotice: string;
  anpePermitRequired: boolean;
  liabilityDisclaimer: string;
}

