// ==============================================================================
// SymbioCarb AI - Supplier Emissions Communication XML Route
// Validates factory payload and generates XML using the unified CBAM engine.
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  CbamXmlPayload,
  buildCbamXmlFilename,
  generateCbamSupplierXml,
  validateCbamXmlInput,
} from '@/lib/engine/cbam-xml';

export async function POST(req: NextRequest) {
  let payload: CbamXmlPayload;
  try {
    payload = (await req.json()) as CbamXmlPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body. Submit factory audit data to generate the CBAM supplier communication XML.' },
      { status: 400 }
    );
  }

  const validation = validateCbamXmlInput(payload || {});
  if (!validation.valid || !validation.cbamResult) {
    return NextResponse.json(
      {
        error: validation.errorMessage || 'Missing required installation data.',
        missingFields: validation.missingFields,
      },
      { status: 400 }
    );
  }

  const xmlContent = generateCbamSupplierXml(payload, validation.cbamResult);
  const filename = buildCbamXmlFilename(validation.cbamResult.cnCode8);

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      error:
        'GET export without installation payload is disabled. Submit a POST request with complete factory data (companyName, exportCnCode, annualProductionTons, and emissions inputs).',
      missingFields: ['companyName', 'exportCnCode', 'annualProductionTons', 'emissionsInputs'],
    },
    { status: 400 }
  );
}
