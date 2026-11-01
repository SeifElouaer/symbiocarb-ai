// ==============================================================================
// Voice Processing Route Handler (/api/telegram/voice)
// Transcribes Tunisian Darija voice notes (.ogg) and extracts industrial intents
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { parseTunisianAudioOrText } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, mimeType = 'audio/ogg' } = body;

    if (!audioBase64) {
      return NextResponse.json({ ok: false, error: 'Audio data is required' }, { status: 400 });
    }

    const reply = await parseTunisianAudioOrText('', true, audioBase64, mimeType);

    return NextResponse.json({
      ok: true,
      transcription: reply,
      reply,
    });
  } catch (error) {
    console.error('Error processing voice audio:', error);
    return NextResponse.json(
      { ok: false, reply: 'واضح سي سيف! سمعتك، ورانا نتبعو في وضعية المعمل.' },
      { status: 500 }
    );
  }
}

