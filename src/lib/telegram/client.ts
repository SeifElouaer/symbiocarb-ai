// ==============================================================================
// Live Telegram Bot API Client (DarjaBot - Free Shop-Floor Messaging in Tunisia)
// Supports Real Outbound Push & Localhost Inbound Polling via getUpdates
// ==============================================================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9055191465:AAHMTeWppm4rn2GYUuN8IebcWK-_mHUfv98';
const TELEGRAM_DEFAULT_CHAT_ID = process.env.TELEGRAM_DEFAULT_CHAT_ID || '6318474502';

const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export async function sendTelegramMessage(
  text: string,
  chatId: string = TELEGRAM_DEFAULT_CHAT_ID,
  inlineButtons?: TelegramInlineButton[][]
) {
  try {
    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };

    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineButtons,
      };
    }

    const response = await fetch(`${BASE_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return { ok: false, error: String(error) };
  }
}

export async function getTelegramUpdates(offset?: number) {
  try {
    const url = offset ? `${BASE_URL}/getUpdates?offset=${offset}&timeout=5` : `${BASE_URL}/getUpdates?limit=20`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Telegram updates:', error);
    return { ok: false, result: [] };
  }
}

export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/getFile?file_id=${fileId}`);
    const data = await response.json();
    if (data.ok && data.result.file_path) {
      return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
    }
    return null;
  } catch (error) {
    console.error('Failed to get Telegram file URL:', error);
    return null;
  }
}

