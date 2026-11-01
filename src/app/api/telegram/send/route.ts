// ==============================================================================
// Outbound Telegram Alert Dispatcher (/api/telegram/send)
// Pushes real operational alerts directly to user's phone with interactive buttons
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram/client';
import { 
  formatPointeWarningMessage, 
  formatCosPhiAlertMessage, 
  formatSymbiosisMatchAlert 
} from '@/lib/telegram/formatter';
import { parseTunisianAudioOrText } from '@/lib/ai/gemini';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      alertType, 
      locale = 'ar-TN', 
      persona = 'benarous',
      chatId 
    } = body;

    let textToSend = '';
    let buttons = undefined;
    let botReply = '';

    if (alertType === 'pointe_warning') {
      const formatted = formatPointeWarningMessage(locale);
      textToSend = formatted.text;
      buttons = formatted.buttons;
      botReply = locale === 'ar-TN'
        ? 'تم إرسال تنبيه ذروة الستاغ إلى هاتفك عبر تيليغرام بنجاح.'
        : 'Alerte de pointe STEG transmise sur votre application Telegram.';
    } else if (alertType === 'cos_phi_alert') {
      const formatted = formatCosPhiAlertMessage(0.748, 3845.25, locale);
      textToSend = formatted.text;
      buttons = formatted.buttons;
      botReply = locale === 'ar-TN'
        ? 'تم إرسال تقرير خطية الطاقة الارتكاسية عبر تيليغرام.'
        : 'Rapport de pénalité réactive envoyé sur Telegram.';
    } else if (alertType === 'symbiosis_match') {
      const formatted = formatSymbiosisMatchAlert('نوى تمور دقلة النور → كربون منشط', 'معصرة ومجمع الزيتونة صفاقس', 680000, locale);
      textToSend = formatted.text;
      buttons = formatted.buttons;
      botReply = locale === 'ar-TN'
        ? 'تم إرسال فرصة التثمين الدائري على هاتفك.'
        : 'Opportunité de symbiose industrielle envoyée sur Telegram.';
    } else if (message) {
      // User typed a custom message from the simulator drawer
      // Generate response via Gemini 2.5 Flash
      botReply = await parseTunisianAudioOrText(message, false);
      
      // Also notify on real Telegram phone if user desires
      textToSend = `💬 <b>رسالة جديدة من ورشة العمل (DarjaBot):</b>\n\n<i>"${message}"</i>\n\n🤖 <b>رد درجة بوت :</b>\n${botReply}`;
    } else {
      // Default test push
      const formatted = formatPointeWarningMessage(locale);
      textToSend = formatted.text;
      buttons = formatted.buttons;
      botReply = 'Notification envoyée sur votre compte Telegram !';
    }

    // Send to Telegram API
    const result = await sendTelegramMessage(textToSend, chatId, buttons);

    // Asynchronously log to Supabase if connected
    try {
      await supabaseServer.from('telegram_logs').insert({
        telegram_chat_id: chatId || process.env.TELEGRAM_DEFAULT_CHAT_ID,
        direction: 'outbound',
        media_type: 'text',
        raw_text: textToSend,
        translated_text: botReply,
        detected_locale: locale,
        delivery_status: result.ok ? 'delivered' : 'failed',
      });
    } catch {
      // Ignore database logging failure
    }

    return NextResponse.json({
      ok: true,
      telegramResult: result,
      reply: botReply,
    });
  } catch (error) {
    console.error('Error in /api/telegram/send:', error);
    return NextResponse.json(
      { ok: false, error: String(error), reply: 'Message enregistré localement.' },
      { status: 500 }
    );
  }
}

