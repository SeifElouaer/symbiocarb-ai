// ==============================================================================
// Official European Commission EU CBAM XML Communication Generator
// Dynamically builds XML from factory parameters (no hardcoded demo company).
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const company = escapeXml(url.searchParams.get('company') || 'Entreprise Non Configuree');
  const governorate = escapeXml(url.searchParams.get('governorate') || 'Tunisie');
  const zone = escapeXml(url.searchParams.get('zone') || 'Site Industriel');
  const cnCode = escapeXml((url.searchParams.get('cnCode') || '00000000').replace(/\s+/g, ''));
  const product = escapeXml(url.searchParams.get('product') || 'Produit Industriel');
  const productionTons = Number(url.searchParams.get('productionTons') || 0);
  const scope1 = Number(url.searchParams.get('scope1') || 0);
  const scope2 = Number(url.searchParams.get('scope2') || 0);
  const scope3 = Number(url.searchParams.get('scope3') || 0);
  const see = Number(url.searchParams.get('see') || 0);

  const date = new Date().toISOString().split('T')[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMCommunication xmlns="urn:eu:taxud:cbam:v1" version="1.0">
  <Header>
    <MessageId>CBAM-TN-${Date.now()}</MessageId>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <ReportingYear>${new Date().getFullYear()}</ReportingYear>
    <DeclarantType>OPERATOR</DeclarantType>
  </Header>

  <Installation>
    <InstallationName>${company}</InstallationName>
    <CountryCode>TN</CountryCode>
    <Governorate>${governorate}</Governorate>
    <IndustrialZone>${zone}</IndustrialZone>
    <VerificationStatus>PRE_AUDIT_INTERNAL_DRAFT</VerificationStatus>
    <VerifierAuthority>
      <AccreditationStandard>ISO 14065:2020 / Regulation (EU) 2023/956</AccreditationStandard>
      <LegalDisclaimer>Document préparatoire généré à partir des données déclarées par l'entreprise. Doit être vérifié par un organisme accrédité avant soumission au Registre TAXUD.</LegalDisclaimer>
    </VerifierAuthority>
  </Installation>

  <ProductionProcesses>
    <Process id="PROC-MAIN">
      <ProcessName>${product}</ProcessName>
      <ActivityLevel unit="tonnes">${productionTons.toFixed(2)}</ActivityLevel>
      <DirectEmissionsScope1>
        <TotalDirectEmissions unit="tCO2e">${scope1.toFixed(2)}</TotalDirectEmissions>
      </DirectEmissionsScope1>
      <IndirectEmissionsScope2>
        <ElectricitySource>STEG National Grid (Tunisia)</ElectricitySource>
        <GridEmissionFactor unit="tCO2e/MWh">0.473</GridEmissionFactor>
        <TotalIndirectEmissions unit="tCO2e">${scope2.toFixed(2)}</TotalIndirectEmissions>
      </IndirectEmissionsScope2>
      <PrecursorsScope3>
        <TotalPrecursorEmissions unit="tCO2e">${scope3.toFixed(2)}</TotalPrecursorEmissions>
      </PrecursorsScope3>
    </Process>
  </ProductionProcesses>

  <AggregatedGoodsExported>
    <GoodsItem>
      <CNCode>${cnCode}</CNCode>
      <GoodsDescription>${product}</GoodsDescription>
      <ExportQuantity unit="tonnes">${productionTons.toFixed(2)}</ExportQuantity>
      <SpecificEmbeddedEmissions unit="tCO2e/tonne">${see.toFixed(3)}</SpecificEmbeddedEmissions>
    </GoodsItem>
  </AggregatedGoodsExported>
</CBAMCommunication>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="CBAM_Declaration_${date}.xml"`,
    },
  });
}
