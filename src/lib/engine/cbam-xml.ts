// ==============================================================================
// SymbioCarb AI - Supplier Emissions Communication XML Generator
// Generates supplier-to-EU-importer CBAM emissions communication XML from the
// unified CBAM calculator. Not an official EU customs / DG TAXUD submission.
// ==============================================================================

import { CbamCalculationResult } from '@/types';
import { STEG_GRID_EF_KG_CO2E_PER_KWH, normalizeCnCode } from './cbam-config';
import { CbamReportInput, PrecursorMaterial, calculateCbamReport } from './cbam-calculator';

export interface CbamXmlPayload {
  companyName?: string;
  fiscalId?: string;
  governorate?: string;
  industrialZone?: string;
  exportCnCode?: string;
  exportProductName?: string;
  annualProductionTons?: number;
  annualExportTons?: number;
  naturalGasM3?: number;
  heavyFuelTons?: number;
  dieselLiters?: number;
  kwhJour?: number;
  kwhPointe?: number;
  kwhSoir?: number;
  kwhNuit?: number;
  annualElectricityKwh?: number;
  steelTons?: number;
  aluminumTons?: number;
  bomMaterials?: PrecursorMaterial[];
  cbamReportingYear?: number;
  cbamCertificatePriceEur?: number;
  carbonPricePaidAbroadEur?: number;
  euDefaultSeeOverride?: number | null;
  defaultComparisonInformative?: {
    defaultSeeBase: number;
    markupPct: number;
    defaultSeeWithMarkup: number;
    liabilityDefaultEur: number;
    liabilityActualEur: number;
    savingForImporterEur: number;
    savingPerTonneEur: number;
  } | null;
}

export interface CbamXmlValidationResult {
  valid: boolean;
  missingFields: string[];
  errorMessage?: string;
  cbamInput?: CbamReportInput;
  cbamResult?: CbamCalculationResult;
}

export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildCbamXmlFilename(cnCode: string, dateStr?: string): string {
  const cleanCn = normalizeCnCode(cnCode) || 'UNKNOWN';
  const date = dateStr || new Date().toISOString().split('T')[0];
  return `SymbioCarb_CBAM_Supplier_Communication_${cleanCn}_${date}.xml`;
}

export function buildCbamInputFromPayload(payload: CbamXmlPayload): CbamReportInput {
  const monthlyKwh =
    (Number(payload.kwhJour) || 0) +
    (Number(payload.kwhPointe) || 0) +
    (Number(payload.kwhSoir) || 0) +
    (Number(payload.kwhNuit) || 0);
  const annualElectricityKwh =
    typeof payload.annualElectricityKwh === 'number' && payload.annualElectricityKwh > 0
      ? payload.annualElectricityKwh
      : monthlyKwh * 12;

  return {
    productName: (payload.exportProductName || '').trim() || 'Industrial Export Good',
    cnCode8: (payload.exportCnCode || '').trim(),
    finishedProductTons: Number(payload.annualProductionTons) || 0,
    annualExportTons: Number(payload.annualExportTons) || 0,
    naturalGasM3PerMonth: Number(payload.naturalGasM3) || 0,
    heavyFuelTonsPerMonth: Number(payload.heavyFuelTons) || 0,
    dieselLitersPerMonth: Number(payload.dieselLiters) || 0,
    annualElectricityKwh,
    precursors: Array.isArray(payload.bomMaterials) ? payload.bomMaterials : [],
    legacySteelTons: Number(payload.steelTons) || 0,
    legacyAluminumTons: Number(payload.aluminumTons) || 0,
    reportingYear: Number(payload.cbamReportingYear) || 2026,
    cbamCertificatePriceEur:
      typeof payload.cbamCertificatePriceEur === 'number'
        ? payload.cbamCertificatePriceEur
        : undefined,
    carbonPricePaidAbroadEur: Number(payload.carbonPricePaidAbroadEur) || 0,
  };
}

export function validateCbamXmlInput(payload: CbamXmlPayload): CbamXmlValidationResult {
  const missingFields: string[] = [];

  if (!payload.companyName || payload.companyName.trim().length < 2) {
    missingFields.push('companyName');
  }
  const cleanCn = normalizeCnCode(payload.exportCnCode || '');
  if (cleanCn.length < 4) {
    missingFields.push('exportCnCode');
  }
  const prodTons = Number(payload.annualProductionTons) || 0;
  if (prodTons <= 0) {
    missingFields.push('annualProductionTons');
  }

  const cbamInput = buildCbamInputFromPayload(payload);
  const cbamResult = calculateCbamReport(cbamInput);

  if (cbamResult.corporateFootprint.totalTco2e <= 0) {
    missingFields.push('emissionsInputs');
  }

  if (missingFields.length > 0) {
    return {
      valid: false,
      missingFields,
      errorMessage:
        `Required installation data is missing or incomplete: ${missingFields.join(', ')}. ` +
        'Provide company name, CN code (>= 4 digits), positive production tonnage, and at least one emissions input (fuel, STEG electricity, or BOM material).',
    };
  }

  return {
    valid: true,
    missingFields: [],
    cbamInput,
    cbamResult,
  };
}

export function generateCbamSupplierXml(
  payload: CbamXmlPayload,
  cbamResult: CbamCalculationResult,
  now: Date = new Date()
): string {
  const company = escapeXml((payload.companyName || '').trim());
  const fiscalId = escapeXml((payload.fiscalId || '').trim() || 'N/A');
  const governorate = escapeXml((payload.governorate || '').trim() || 'Tunisie');
  const zone = escapeXml((payload.industrialZone || '').trim() || 'N/A');
  const cleanCn = escapeXml(normalizeCnCode(cbamResult.cnCode8));
  const product = escapeXml(cbamResult.productName || 'Industrial Export Good');
  const isoTimestamp = now.toISOString();

  const informativeComparisonXml = payload.defaultComparisonInformative
    ? `
  <InformativeDefaultComparison>
    <DefaultSpecificEmbeddedEmissionsBase unit="tCO2e/tonne">${payload.defaultComparisonInformative.defaultSeeBase.toFixed(3)}</DefaultSpecificEmbeddedEmissionsBase>
    <DefaultMarkupPercent>${payload.defaultComparisonInformative.markupPct.toFixed(1)}</DefaultMarkupPercent>
    <DefaultSpecificEmbeddedEmissionsWithMarkup unit="tCO2e/tonne">${payload.defaultComparisonInformative.defaultSeeWithMarkup.toFixed(3)}</DefaultSpecificEmbeddedEmissionsWithMarkup>
    <ImporterLiabilityWithDefault unit="EUR">${payload.defaultComparisonInformative.liabilityDefaultEur}</ImporterLiabilityWithDefault>
    <ImporterLiabilityWithActual unit="EUR">${payload.defaultComparisonInformative.liabilityActualEur}</ImporterLiabilityWithActual>
    <EstimatedImporterSaving unit="EUR">${payload.defaultComparisonInformative.savingForImporterEur}</EstimatedImporterSaving>
    <EstimatedImporterSavingPerTonne unit="EUR/tonne">${payload.defaultComparisonInformative.savingPerTonneEur.toFixed(2)}</EstimatedImporterSavingPerTonne>
  </InformativeDefaultComparison>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  SymbioCarb AI — Supplier Emissions Communication for EU Importer
  Notice: The official CBAM declaration and certificate surrender are filed solely by the
  EU authorised CBAM declarant (the EU importer) in the EU CBAM Registry under Regulation (EU) 2023/956.
  This supplier communication provides installation-level data that must be verified by an accredited
  independent verifier (ISO 14065 / EU CBAM implementing rules) before use in an annual CBAM declaration.
-->
<SupplierEmissionsCommunication xmlns="urn:symbiocarb:cbam-supplier-communication:v1" version="1.0">
  <Header>
    <MessageId>SC-CBAM-SUP-${now.getTime()}</MessageId>
    <Timestamp>${isoTimestamp}</Timestamp>
    <ReportingYear>${cbamResult.cbamScope.reportingYear}</ReportingYear>
    <CommunicationRole>THIRD_COUNTRY_INSTALLATION_OPERATOR</CommunicationRole>
    <LegalNote>Prepared for transmission to EU importer (authorised CBAM declarant). Subject to accredited third-party verification.</LegalNote>
  </Header>

  <Installation>
    <InstallationName>${company}</InstallationName>
    <FiscalIdentifier>${fiscalId}</FiscalIdentifier>
    <CountryCode>TN</CountryCode>
    <Governorate>${governorate}</Governorate>
    <IndustrialZone>${zone}</IndustrialZone>
    <VerificationStatus>${cbamResult.verificationStatus}</VerificationStatus>
    <AccreditationStandard>ISO 14065 / Regulation (EU) 2023/956</AccreditationStandard>
    <AuditIntegrityHash>${escapeXml(cbamResult.auditIntegrityHash)}</AuditIntegrityHash>
  </Installation>

  <CorporateInventoryISO14064>
    <Scope1DirectEmissions unit="tCO2e">${cbamResult.corporateFootprint.scope1DirectTco2e.toFixed(2)}</Scope1DirectEmissions>
    <Scope2IndirectEmissions unit="tCO2e">${cbamResult.corporateFootprint.scope2IndirectTco2e.toFixed(2)}</Scope2IndirectEmissions>
    <Scope3AllBomEmissions unit="tCO2e">${cbamResult.corporateFootprint.scope3AllBomTco2e.toFixed(2)}</Scope3AllBomEmissions>
    <TotalCorporateFootprint unit="tCO2e">${cbamResult.corporateFootprint.totalTco2e.toFixed(2)}</TotalCorporateFootprint>
    <CorporateIntensity unit="tCO2e/tonne">${cbamResult.corporateFootprint.intensityTco2ePerTon.toFixed(3)}</CorporateIntensity>
  </CorporateInventoryISO14064>

  <CbamGoodsCommunicated>
    <Good>
      <CNCode>${cleanCn}</CNCode>
      <GoodsDescription>${product}</GoodsDescription>
      <CbamSector>${cbamResult.cbamScope.sector}</CbamSector>
      <InCbamScope>${cbamResult.cbamScope.isInCbamScope}</InCbamScope>
      <IndirectEmissionsIncludedInCbam>${cbamResult.cbamScope.indirectEmissionsIncluded}</IndirectEmissionsIncludedInCbam>
      <ProductionQuantity unit="tonnes">${cbamResult.finishedProductTons.toFixed(2)}</ProductionQuantity>
      <ExportQuantityToEU unit="tonnes">${cbamResult.cbamScope.exportTonnes.toFixed(2)}</ExportQuantityToEU>
      <DirectEmissions unit="tCO2e">${cbamResult.cbamScope.directEmissionsTco2e.toFixed(2)}</DirectEmissions>
      <CbamRelevantPrecursorEmissions unit="tCO2e">${cbamResult.cbamScope.cbamRelevantPrecursorsTco2e.toFixed(2)}</CbamRelevantPrecursorEmissions>
      <IndirectEmissionsForInformation unit="tCO2e">${cbamResult.cbamScope.indirectEmissionsForInfoTco2e.toFixed(2)}</IndirectEmissionsForInformation>
      <IndirectEmissionsGridFactor unit="kgCO2e/kWh">${STEG_GRID_EF_KG_CO2E_PER_KWH}</IndirectEmissionsGridFactor>
      <IndirectEmissionsCountedInCbam unit="tCO2e">${cbamResult.cbamScope.indirectEmissionsCountedTco2e.toFixed(2)}</IndirectEmissionsCountedInCbam>
      <TotalCbamEmbeddedEmissions unit="tCO2e">${cbamResult.cbamScope.totalCbamEmbeddedTco2e.toFixed(2)}</TotalCbamEmbeddedEmissions>
      <CbamSpecificEmbeddedEmissions unit="tCO2e/tonne">${cbamResult.cbamScope.cbamSeeTco2ePerTon.toFixed(3)}</CbamSpecificEmbeddedEmissions>
      <BenchmarkApplied unit="tCO2e/tonne">${cbamResult.cbamScope.benchmarkTco2ePerTon.toFixed(3)}</BenchmarkApplied>
      <FreeAllocationFactor>${cbamResult.cbamScope.freeAllocationFactor.toFixed(3)}</FreeAllocationFactor>
      <EstimatedCertificatesRequired unit="certificates">${cbamResult.cbamScope.certificatesRequired.toFixed(2)}</EstimatedCertificatesRequired>
      <IndicativeCertificatePrice unit="EUR/tCO2e">${cbamResult.cbamScope.cbamCertificatePriceEur.toFixed(2)}</IndicativeCertificatePrice>
      <EstimatedImporterLiability unit="EUR">${cbamResult.cbamScope.estimatedLiabilityEur}</EstimatedImporterLiability>
    </Good>
  </CbamGoodsCommunicated>${informativeComparisonXml}
</SupplierEmissionsCommunication>`;
}
