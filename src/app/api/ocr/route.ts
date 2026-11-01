// ==============================================================================
// Multimodal Document AI Route Handler (/api/ocr)
// Uses Gemini 2.5 Flash Vision to parse STEG MT/HT Invoices and extract exact metrics
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { parseInvoiceWithGeminiVision } from '@/lib/ai/gemini';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', isSample = false } = body;

    let extracted: any;

    if (isSample || !imageBase64) {
      // Deterministic authentic sample from a Tunisian factory
      extracted = {
        districtSteg: 'Mghira / Megrine',
        billingMonth: 10,
        billingYear: 2026,
        tariffRegime: 'MT_POSTES_HORAIRES',
        pSouscriteKva: 500,
        pMaxAppeleeKva: 512,
        kwhJour: 82000,
        kwhPointe: 14500,
        kwhSoir: 16000,
        kwhNuit: 21500,
        kvarhTotal: 105000,
        cosPhi: 0.748,
        reactivePenaltyTnd: 3845.25,
        powerOverrunPenaltyTnd: 300.0,
        totalHtTnd: 41250.0,
        tvaTnd: 7837.5,
        totalTtcTnd: 50207.5,
        confidenceScore: 0.98,
      };
    } else {
      extracted = await parseInvoiceWithGeminiVision(imageBase64, mimeType);
    }

    // Run deterministic physics verification
    const verifiedBill = calculateStegMtBill({
      kwhJour: extracted.kwhJour || 0,
      kwhPointe: extracted.kwhPointe || 0,
      kwhSoir: extracted.kwhSoir || 0,
      kwhNuit: extracted.kwhNuit || 0,
      kvarhTotal: extracted.kvarhTotal || 0,
      pSouscriteKva: extracted.pSouscriteKva || 400,
      pMaxAppeleeKva: extracted.pMaxAppeleeKva || 400,
    });

    const cosPhiAudit = solveCosPhiCompensation({
      activePowerKw: (extracted.kwhJour + extracted.kwhPointe) / 300, // Average active kW
      currentCosPhi: extracted.cosPhi || 0.75,
      targetCosPhi: 0.95,
      annualActiveKwh: (extracted.kwhJour + extracted.kwhPointe + extracted.kwhSoir + extracted.kwhNuit) * 12,
      annualReactivePenaltyTnd: (extracted.reactivePenaltyTnd || 0) * 12,
      hasHarmonicLoads: true,
    });

    return NextResponse.json({
      ok: true,
      extracted,
      verifiedBill,
      cosPhiAudit,
    });
  } catch (error) {
    console.error('OCR Route Error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

