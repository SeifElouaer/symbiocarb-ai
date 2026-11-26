import { describe, it, expect } from 'vitest';
import { calculateCbamReport } from '../cbam-calculator';
import {
  buildCbamInputFromPayload,
  buildCbamXmlFilename,
  generateCbamSupplierXml,
  validateCbamXmlInput,
} from '../cbam-xml';
import { POST, GET } from '@/app/api/export/cbam-xml/route';
import { NextRequest } from 'next/server';

describe('Task 1: Unified CBAM single source of truth & Supplier XML export', () => {
  const samplePayload = {
    companyName: 'Ateliers Mécaniques de Ben Arous',
    fiscalId: '1234567/A/M/000',
    governorate: 'Ben Arous',
    industrialZone: 'ZI Ben Arous',
    exportCnCode: '7326 90 98',
    exportProductName: 'Pièces usinées en acier',
    annualProductionTons: 1200,
    annualExportTons: 1200,
    naturalGasM3: 10000,
    heavyFuelTons: 0,
    dieselLiters: 500,
    kwhJour: 70000,
    kwhPointe: 22000,
    kwhSoir: 16000,
    kwhNuit: 26000,
    bomMaterials: [
      {
        name: 'Tôles acier laminées à froid',
        cnCode8: '7209 16 90',
        quantityTons: 1100,
        efTco2ePerTon: 2.1,
      },
      {
        name: 'Barres acier',
        cnCode8: '7214 20 00',
        quantityTons: 250,
        efTco2ePerTon: 1.85,
      },
    ],
    cbamReportingYear: 2026,
    cbamCertificatePriceEur: 85,
  };

  it('produces identical CBAM values across cockpit, /cbam, PDF and XML for the same factory input', () => {
    // 1. Unified engine call (used by AuditContext -> cockpit & /cbam & PDF)
    const input = buildCbamInputFromPayload(samplePayload);
    const engineResult = calculateCbamReport(input);

    // 2. XML validation & generation (used by /api/export/cbam-xml)
    const validation = validateCbamXmlInput(samplePayload);
    expect(validation.valid).toBe(true);
    const xmlResult = validation.cbamResult!;
    const xml = generateCbamSupplierXml(samplePayload, xmlResult, new Date('2026-11-26T10:00:00Z'));

    // Cockpit, /cbam, PDF, and XML all match identically
    expect(xmlResult.corporateFootprint.scope1DirectTco2e).toBe(
      engineResult.corporateFootprint.scope1DirectTco2e
    );
    expect(xmlResult.corporateFootprint.scope2IndirectTco2e).toBe(
      engineResult.corporateFootprint.scope2IndirectTco2e
    );
    expect(xmlResult.cbamScope.cbamSeeTco2ePerTon).toBe(engineResult.cbamScope.cbamSeeTco2ePerTon);
    expect(xmlResult.cbamScope.estimatedLiabilityEur).toBe(
      engineResult.cbamScope.estimatedLiabilityEur
    );

    expect(xml).toContain('xmlns="urn:symbiocarb:cbam-supplier-communication:v1"');
    expect(xml).toContain('EU authorised CBAM declarant');
    expect(xml).toContain('accredited');
    expect(xml).toContain(`<CNCode>73269098</CNCode>`);
    expect(xml).toContain(
      `<DirectEmissions unit="tCO2e">${engineResult.cbamScope.directEmissionsTco2e.toFixed(2)}</DirectEmissions>`
    );
    expect(xml).toContain(
      `<CbamRelevantPrecursorEmissions unit="tCO2e">${engineResult.cbamScope.cbamRelevantPrecursorsTco2e.toFixed(2)}</CbamRelevantPrecursorEmissions>`
    );
    expect(xml).toContain(
      `<IndirectEmissionsForInformation unit="tCO2e">${engineResult.cbamScope.indirectEmissionsForInfoTco2e.toFixed(2)}</IndirectEmissionsForInformation>`
    );
    expect(xml).toContain(
      `<IndirectEmissionsIncludedInCbam>false</IndirectEmissionsIncludedInCbam>`
    );
    expect(xml).toContain(
      `<CbamSpecificEmbeddedEmissions unit="tCO2e/tonne">${engineResult.cbamScope.cbamSeeTco2ePerTon.toFixed(3)}</CbamSpecificEmbeddedEmissions>`
    );
    expect(xml).toContain(
      `<EstimatedImporterLiability unit="EUR">${engineResult.cbamScope.estimatedLiabilityEur}</EstimatedImporterLiability>`
    );
  });

  it('builds the required supplier communication XML filename', () => {
    expect(buildCbamXmlFilename('7326 90 98', '2026-11-26')).toBe(
      'SymbioCarb_CBAM_Supplier_Communication_73269098_2026-11-26.xml'
    );
  });

  it('returns HTTP 400 on GET and on incomplete POST, and returns HTTP 200 XML on complete POST', async () => {
    const getRes = await GET();
    expect(getRes.status).toBe(400);

    const incompleteReq = new NextRequest('http://localhost:3000/api/export/cbam-xml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: '', exportCnCode: '', annualProductionTons: 0 }),
    });
    const incompleteRes = await POST(incompleteReq);
    expect(incompleteRes.status).toBe(400);
    const errJson = await incompleteRes.json();
    expect(errJson.missingFields).toContain('companyName');
    expect(errJson.missingFields).toContain('exportCnCode');
    expect(errJson.missingFields).toContain('annualProductionTons');
    expect(errJson.missingFields).toContain('emissionsInputs');

    const validReq = new NextRequest('http://localhost:3000/api/export/cbam-xml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(samplePayload),
    });
    const validRes = await POST(validReq);
    expect(validRes.status).toBe(200);
    const disposition = validRes.headers.get('Content-Disposition') || '';
    expect(disposition).toContain('SymbioCarb_CBAM_Supplier_Communication_73269098_');
    const body = await validRes.text();
    expect(body).toContain('<SupplierEmissionsCommunication');
  });
});
