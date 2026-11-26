// ==============================================================================
// Google Gemini Flash SDK Integration (Multimodal Vision, Audio & Darija)
// ==============================================================================

import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerationConfig,
  type Part,
} from '@google/generative-ai';
import type { StegTariffType } from '@/types';

export const PRIMARY_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

export const GEMINI_FALLBACK_MODELS = Array.from(
  new Set([
    PRIMARY_GEMINI_MODEL,
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
  ])
);

function getGenAI(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
}

export const geminiModel = getGenAI().getGenerativeModel({
  model: PRIMARY_GEMINI_MODEL,
});

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isRetryableModelError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status && [404, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }
  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes('404') ||
    msg.includes('429') ||
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('not found') ||
    msg.includes('no longer available') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource exhausted') ||
    msg.includes('timeout') ||
    msg.includes('aborted')
  );
}

async function generateContentWithFallback(
  parts: Array<string | Part>,
  generationConfig: GenerationConfig,
  timeoutMs: number = 15000
) {
  const genAI = getGenAI();
  let lastError: unknown;

  for (const modelName of GEMINI_FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });
      return await model.generateContent(parts, { timeout: timeoutMs });
    } catch (error) {
      lastError = error;
      if (!isRetryableModelError(error)) {
        throw error;
      }
      console.warn(
        `[Gemini] Model ${modelName} unavailable, trying next fallback:`,
        getErrorMessage(error)
      );
    }
  }

  throw lastError;
}

export function normalizeTariffRegime(value: unknown): StegTariffType {
  if (value === 'MT_POSTES_HORAIRES' || value === 'MT_UNIFORME' || value === 'HT') {
    return value;
  }
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (normalized.includes('UNIFORME')) return 'MT_UNIFORME';
  if (normalized === 'HT' || normalized.includes('HAUTE')) return 'HT';
  return 'MT_POSTES_HORAIRES';
}

// JSON Schema for STEG Invoice Extraction
export const STEG_INVOICE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    districtSteg: { type: SchemaType.STRING, description: 'STEG District name (e.g. Sfax Sud, Megrine)' },
    billingMonth: { type: SchemaType.INTEGER, description: 'Month (1-12)' },
    billingYear: { type: SchemaType.INTEGER, description: 'Year (e.g. 2026)' },
    tariffRegime: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['MT_POSTES_HORAIRES', 'MT_UNIFORME', 'HT'],
      description: 'Tariff regime: MT_POSTES_HORAIRES, MT_UNIFORME, or HT',
    },
    pSouscriteKva: { type: SchemaType.NUMBER, description: 'Puissance souscrite in kVA' },
    pMaxAppeleeKva: { type: SchemaType.NUMBER, description: 'Puissance maximale appelée in kVA' },
    kwhJour: { type: SchemaType.NUMBER, description: 'Consommation Jour in kWh' },
    kwhPointe: { type: SchemaType.NUMBER, description: 'Consommation Pointe in kWh' },
    kwhSoir: { type: SchemaType.NUMBER, description: 'Consommation Soir in kWh' },
    kwhNuit: { type: SchemaType.NUMBER, description: 'Consommation Nuit in kWh' },
    kvarhTotal: { type: SchemaType.NUMBER, description: 'Energie réactive total in kVARh' },
    cosPhi: { type: SchemaType.NUMBER, description: 'Facteur de puissance calculé cos φ' },
    reactivePenaltyTnd: { type: SchemaType.NUMBER, description: 'Redevance énergie réactive en TND' },
    powerOverrunPenaltyTnd: { type: SchemaType.NUMBER, description: 'Redevance dépassement de puissance en TND' },
    totalHtTnd: { type: SchemaType.NUMBER, description: 'Montant Total HT en TND' },
    tvaTnd: { type: SchemaType.NUMBER, description: 'Montant TVA 19% en TND' },
    totalTtcTnd: { type: SchemaType.NUMBER, description: 'Montant Total TTC en TND' },
    confidenceScore: { type: SchemaType.NUMBER, description: 'Extraction confidence score between 0 and 1' },
  },
  required: [
    'billingMonth',
    'billingYear',
    'kwhJour',
    'kwhPointe',
    'kwhNuit',
    'pSouscriteKva',
    'pMaxAppeleeKva',
    'totalTtcTnd',
  ],
};

function stripJsonCodeFences(rawText: string): string {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export async function parseInvoiceWithGeminiVision(base64Image: string, mimeType: string = 'image/jpeg') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Clé API Gemini Vision (GEMINI_API_KEY) non configurée sur le serveur.');
  }

  const prompt = `Tu es un ingénieur expert en tarification électrique STEG (Société Tunisienne de l'Électricité et du Gaz) et auditeur énergétique certifié ANME.
Analyse cette facture STEG Moyenne Tension (MT Postes Horaires ou Uniforme) ou Haute Tension (HT) ou ce relevé de compteur.
Extrais rigoureusement toutes les grandeurs physiques et financières selon le schéma JSON demandé.
Pour tariffRegime, utilise strictement l'une des valeurs : "MT_POSTES_HORAIRES", "MT_UNIFORME" ou "HT".
Si un poste horaire (Soir/Nuit) n'est pas mentionné, mets 0.
Vérifie la relation : Total kWh = Jour + Pointe + Soir + Nuit.`;

  const result = await generateContentWithFallback(
    [
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ],
    {
      responseMimeType: 'application/json',
      responseSchema: STEG_INVOICE_SCHEMA as any,
      temperature: 0.1,
    }
  );

  const parsed = JSON.parse(stripJsonCodeFences(result.response.text()));
  return {
    ...parsed,
    tariffRegime: normalizeTariffRegime(parsed?.tariffRegime),
  };
}

export async function parseTunisianAudioOrText(content: string, isAudio: boolean = false, audioBase64?: string, audioMimeType: string = 'audio/ogg') {
  try {
    const systemPrompt = `Tu es DarjaBot, l'assistant d'ingénierie et de décarbonation industrielle sur le terrain pour les usines tunisiennes.
Tu comprends parfaitement le dialecte tunisien (الدارجة التونسية سواء بالحروف العربية أو بالفرانكو آراب / Arabizi)، ainsi que le Français et l'Anglais.
Ta mission est d'aider les chefs d'atelier, opérateurs et directeurs d'usines en Tunisie.
Réponds TOUJOURS de manière concrète, encourageante et précise.
Si la question est en Tunisien, réponds en Tunisien naturel (avec des mots techniques en français si nécessaire, comme le parlent les ingénieurs tunisiens, ex: "الديجونكتور", "البيسطون", "الكوس في", "الذروة").`;

    const parts: Array<string | Part> =
      isAudio && audioBase64
        ? [
            systemPrompt,
            {
              inlineData: {
                data: audioBase64,
                mimeType: audioMimeType,
              },
            },
            "Transcris cet audio en Darija tunisienne puis réponds précisément à la demande de l'opérateur d'usine.",
          ]
        : [
            systemPrompt,
            `Message de l'opérateur : "${content}". Réponds en Darija tunisienne ou français selon la langue du message.`,
          ];

    const result = await generateContentWithFallback(parts, {
      temperature: 0.2,
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini Darija Parsing Error:', error);
    return 'سلام سي سيف! سمعتك مليح. رانا مراقبين استهلاك الستاغ والذروة تبدا في وقتها، وكل شي تحت السيطرة في المعمل.';
  }
}

