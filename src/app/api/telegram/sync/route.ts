// ==============================================================================
// Inbound Telegram Sync & Polling Engine (/api/telegram/sync)
// Polls getUpdates from Telegram Bot API to enable seamless local dev without ngrok
// ==============================================================================

import { NextResponse } from 'next/server';
import { getTelegramUpdates, sendTelegramMessage } from '@/lib/telegram/client';
import { parseTunisianAudioOrText } from '@/lib/ai/gemini';

// In-memory tracked update offset
let lastUpdateId = 0;

export async function GET() {
  try {
    const updates = await getTelegramUpdates(lastUpdateId ? lastUpdateId + 1 : undefined);

    const newMessages: Array<{
      id: string;
      sender: 'user' | 'bot';
      text: string;
      timestamp: string;
    }> = [];

    if (updates.ok && Array.isArray(updates.result)) {
      for (const update of updates.result) {
        if (update.update_id > lastUpdateId) {
          lastUpdateId = update.update_id;
        }

        const msg = update.message;
        if (!msg) continue;

        const chatId = msg.chat?.id;
        const text = msg.text || (msg.voice ? '🎤 [Note vocale Telegram reçue]' : '📷 [Photo de compteur reçue]');

        newMessages.push({
          id: `tel-${msg.message_id}`,
          sender: 'user',
          text: `📱 من تليفونك : "${text}"`,
          timestamp: new Date(msg.date * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Generate intelligent reply via Gemini 2.5 Flash
        const botReply = await parseTunisianAudioOrText(text, Boolean(msg.voice));

        // Reply back to user's Telegram phone!
        if (chatId) {
          await sendTelegramMessage(
            `🤖 <b>درجة بوت :</b>\n\n${botReply}\n\n<i>تمت المزامنة مع سيمبيوكارب AI</i>`,
            String(chatId)
          );
        }

        newMessages.push({
          id: `tel-reply-${msg.message_id}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      newMessages,
      totalReceived: newMessages.length / 2,
    });
  } catch (error) {
    console.error('Error syncing Telegram updates:', error);
    return NextResponse.json({ ok: false, newMessages: [] });
  }
}

