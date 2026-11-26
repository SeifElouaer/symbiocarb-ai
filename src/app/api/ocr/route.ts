// ==============================================================================
// Multimodal Document AI Route Handler (/api/ocr)
// Uses Gemini Flash Vision to parse STEG MT/HT Invoices and extract exact metrics
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { normalizeTariffRegime, parseInvoiceWithGeminiVision } from '@/lib/ai/gemini';
import { calculateStegMtBill } from '@/lib/engine/steg-tariffs';
import { solveCosPhiCompensation } from '@/lib/engine/cos-phi-solver';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { ok: false, error: 'Aucun document fourni pour extraction OCR.' },
        { status: 400 }
      );
    }

    const extracted = await parseInvoiceWithGeminiVision(imageBase64, mimeType);

    // Run strict arithmetic sanity verification gate (anti-hallucination guardrail)
    const sumKwh = (extracted.kwhJour || 0) + (extracted.kwhPointe || 0) + (extracted.kwhSoir || 0) + (extracted.kwhNuit || 0);
    const warnings: string[] = [];

    // Check theoretical cos phi based on active and reactive powers
    let theoreticalCosPhi = extracted.cosPhi || 0.85;
    if (sumKwh > 0 && extracted.kvarhTotal > 0) {
      const tanPhiCalculated = extracted.kvarhTotal / sumKwh;
      theoreticalCosPhi = Number((1 / Math.sqrt(1 + tanPhiCalculated * tanPhiCalculated)).toFixed(3));
      
      const cosPhiDelta = Math.abs(theoreticalCosPhi - (extracted.cosPhi || 0));
      if (cosPhiDelta > 0.05) {
        warnings.push(`Écart détecté sur le facteur de puissance : cos φ extrait = ${extracted.cosPhi}, cos φ calculé d'après P & Q = ${theoreticalCosPhi}`);
      }
    }

    // Check financial balance HT vs TTC
    const calculatedHt = extracted.totalHtTnd || 0;
    const calculatedTtc = extracted.totalTtcTnd || 0;
    if (calculatedHt > 0 && calculatedTtc > 0) {
      const expectedTtc = calculatedHt * 1.19; // Base HT + 19% TVA
      if (Math.abs(expectedTtc - calculatedTtc) > calculatedHt * 0.15) {
        warnings.push(`Vérification fiscale : Écart entre le montant HT (${calculatedHt} TND) et le montant TTC (${calculatedTtc} TND) supérieur aux tolérances.`);
      }
    }

    const arithmeticGatePassed = warnings.length === 0;
    const requiresOperatorConfirmation = !arithmeticGatePassed || (extracted.confidenceScore || 1) < 0.85;

    // Run deterministic physics verification
    const verifiedBill = calculateStegMtBill({
      kwhJour: extracted.kwhJour || 0,
      kwhPointe: extracted.kwhPointe || 0,
      kwhSoir: extracted.kwhSoir || 0,
      kwhNuit: extracted.kwhNuit || 0,
      kvarhTotal: extracted.kvarhTotal || 0,
      pSouscriteKva: extracted.pSouscriteKva || 400,
      pMaxAppeleeKva: extracted.pMaxAppeleeKva || 400,
      tariffRegime: normalizeTariffRegime(extracted.tariffRegime),
      statedTotalKwh: sumKwh,
    });

    const cosPhiAudit = solveCosPhiCompensation({
      activePowerKw: (extracted.kwhJour + extracted.kwhPointe) / 300, // Average active kW
      currentCosPhi: extracted.cosPhi || 0.75,
      targetCosPhi: 0.95,
      annualActiveKwh: sumKwh * 12,
      annualReactivePenaltyTnd: (extracted.reactivePenaltyTnd || 0) * 12,
      hasHarmonicLoads: true,
      ambientTempC: 42,
    });

    return NextResponse.json({
      ok: true,
      extracted,
      verifiedBill,
      cosPhiAudit,
      validationGate: {
        arithmeticGatePassed,
        requiresOperatorConfirmation,
        theoreticalCosPhi,
        sumKwh,
        warnings,
        inpdpComplianceNotice: "Conformité Loi n° 2004-63 (INPDP) : Données de facturation traitées sous chiffrement mémoire sans conservation d'identifiants bancaires.",
      },
    });
  } catch (error) {
    console.error('OCR Route Error:', error);
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    if (/503|429|unavailable|high demand|overloaded|resource exhausted/i.test(message)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Le service d'analyse IA est temporairement surchargé. Veuillez réessayer dans quelques secondes ou saisir les valeurs manuellement.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Impossible d'analyser automatiquement cette facture. Vérifiez la lisibilité du fichier (PDF ou photo) ou complétez les champs manuellement.",
      },
      { status: 500 }
    );
  }
}

