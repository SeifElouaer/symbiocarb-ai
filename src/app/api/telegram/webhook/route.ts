// ==============================================================================
// Live Telegram Webhook Handler (/api/telegram/webhook)
// Production endpoint receiving inbound Telegram updates directly from Telegram servers
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram/client';
import { parseTunisianAudioOrText } from '@/lib/ai/gemini';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = msg.text || (msg.voice ? '🎤 [Note vocale Telegram reçue]' : '📷 [Photo reçue]');

      // Parse with Gemini 2.5 Flash in authentic Tunisian Darija
      const botReply = await parseTunisianAudioOrText(text, Boolean(msg.voice));

      // Reply back to user on Telegram
      if (chatId) {
        await sendTelegramMessage(
          `🤖 <b>درجة بوت :</b>\n\n${botReply}\n\n<i>سيمبيوكارب AI - المنظومة الذكية للمصانع التونسية</i>`,
          String(chatId)
        );
      }

      // Log interaction to Supabase
      try {
        await supabaseServer.from('telegram_logs').insert({
          telegram_chat_id: String(chatId),
          telegram_update_id: update.update_id,
          direction: 'inbound',
          media_type: msg.voice ? 'voice' : msg.photo ? 'photo' : 'text',
          raw_text: text,
          translated_text: botReply,
          detected_locale: 'ar-TN',
          delivery_status: 'delivered',
        });
      } catch {
        // Ignore DB logging error
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

