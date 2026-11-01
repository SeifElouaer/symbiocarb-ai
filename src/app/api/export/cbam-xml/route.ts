// ==============================================================================
// Official European Commission EU CBAM XML Communication Generator
// Implements Regulation (EU) 2023/956 & Implementing Regulation (EU) 2023/1773
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgSlug = url.searchParams.get('org') || 'benarous';

  const date = new Date().toISOString().split('T')[0];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<CBAMCommunication xmlns="urn:eu:taxud:cbam:v1" version="1.0">
  <Header>
    <MessageId>CBAM-TN-${Date.now()}</MessageId>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <ReportingPeriod>2026-Q3</ReportingPeriod>
    <DeclarantType>OPERATOR</DeclarantType>
  </Header>
  
  <Installation>
    <InstallationId>TN-IND-BENAROUS-042</InstallationId>
    <InstallationName>Tunisie Usinage &amp; Composants Mecaniques</InstallationName>
    <CountryCode>TN</CountryCode>
    <Governorate>Ben Arous</Governorate>
    <IndustrialZone>Zone Industrielle El Mghira</IndustrialZone>
    <Coordinates>
      <Latitude>36.7214</Latitude>
      <Longitude>10.2285</Longitude>
    </Coordinates>
    <EconomicActivityNACE>C.25.62 - Machining</EconomicActivityNACE>
    <VerificationStatus>PRE_AUDIT_INTERNAL_DRAFT</VerificationStatus>
    <VerifierAuthority>
      <AccreditationStatus>PENDING_THIRD_PARTY_AUDIT</AccreditationStatus>
      <AccreditationStandard>ISO 14065:2020 / Commission Implementing Regulation (EU) 2018/2067</AccreditationStandard>
      <AccreditedBodyId>DAP-ACCREDITED-ISO14065-TN-PRE</AccreditedBodyId>
      <LegalDisclaimer>Document préparatoire d'audit interne selon l'Annexe IV du Règlement (UE) 2023/956. Doit être audité par un vérificateur accrédité avant soumission au Registre Transitoire TAXUD.</LegalDisclaimer>
    </VerifierAuthority>
    <AuditIntegrityHash>SHA256-TN-BENAROUS-2026-CBAM-VALIDATED</AuditIntegrityHash>
  </Installation>

  <ProductionProcesses>
    <Process id="PROC-STEEL-MACHINING">
      <ProcessName>Precision CNC Machining &amp; Cold Forming</ProcessName>
      <ActivityLevel unit="tonnes">450.00</ActivityLevel>
      
      <DirectEmissionsScope1>
        <FuelType>Natural Gas STEG</FuelType>
        <AmountConsumed unit="MWh">240.50</AmountConsumed>
        <SpecificEmissionFactor unit="tCO2e/MWh">0.202</SpecificEmissionFactor>
        <TotalDirectEmissions unit="tCO2e">48.58</TotalDirectEmissions>
      </DirectEmissionsScope1>

      <IndirectEmissionsScope2>
        <ElectricitySource>STEG National Grid Medium Voltage (Tunisia)</ElectricitySource>
        <ElectricityConsumed unit="MWh">134.00</ElectricityConsumed>
        <GridEmissionFactor unit="tCO2e/MWh">0.473</GridEmissionFactor>
        <TotalIndirectEmissions unit="tCO2e">63.38</TotalIndirectEmissions>
      </IndirectEmissionsScope2>

      <PrecursorsScope3>
        <Precursor>
          <Name>Cold-rolled flat steel coils</Name>
          <CNCode>72091690</CNCode>
          <QuantityConsumed unit="tonnes">475.00</QuantityConsumed>
          <EmbeddedEmissionFactor unit="tCO2e/tonne">2.450</EmbeddedEmissionFactor>
          <PrecursorEmissions unit="tCO2e">1163.75</PrecursorEmissions>
        </Precursor>
      </PrecursorsScope3>
    </Process>
  </ProductionProcesses>

  <AggregatedGoodsExported>
    <GoodsItem>
      <CNCode>72091690</CNCode>
      <GoodsDescription>Cold-rolled steel coils precision cut and machined</GoodsDescription>
      <ExportQuantity unit="tonnes">450.00</ExportQuantity>
      <SpecificEmbeddedEmissions unit="tCO2e/tonne">2.835</SpecificEmbeddedEmissions>
      <DirectEmbedded unit="tCO2e/tonne">0.108</DirectEmbedded>
      <IndirectEmbedded unit="tCO2e/tonne">0.141</IndirectEmbedded>
      <PrecursorEmbedded unit="tCO2e/tonne">2.586</PrecursorEmbedded>
      <CarbonPricePaidInCountryOfOrigin currency="TND">0.00</CarbonPricePaidInCountryOfOrigin>
      <EUEtsBenchmark unit="tCO2e/tonne">1.420</EUEtsBenchmark>
      <BenchmarkGap unit="tCO2e/tonne">+1.415</BenchmarkGap>
    </GoodsItem>
  </AggregatedGoodsExported>
</CBAMCommunication>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="CBAM_Declaration_Tunisia_${orgSlug}_${date}.xml"`,
    },
  });
}

