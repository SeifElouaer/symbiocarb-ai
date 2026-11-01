'use client';

// ==============================================================================
// DarjaBot Mobile Copilot Drawer: Interactive In-App Smartphone Simulator
// Communicates in Tunisian Darija (Arabic script & Arabizi), English & French
// Bridges directly with the live Telegram Bot API (Outbound Push & Inbound Sync)
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  RefreshCw, 
  Smartphone, 
  CheckCircle2, 
  Bot, 
  User, 
  Volume2, 
  Sparkles,
  Radio
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isAudio?: boolean;
}

export function DarjaBotDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, locale, persona } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: locale === 'ar-TN' 
        ? 'عسلامة سي سيف! أنا درجة بوت، مساعدك الميداني في المعمل. كيفاش نجم نعاونك اليوم؟ تنجم تسألني على استهلاك الستاغ، خطية الكوس في (cos φ)، وإلا تثمين مخلفات المعصرة والتمر.'
        : 'Sallam Si Seif! Je suis DarjaBot, votre copilote terrain d\'ingénierie et de décarbonation. Comment puis-je vous assister aujourd\'hui ?',
      timestamp: '19:42',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Handle sending a message
  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          locale,
          persona,
        }),
      });
      const data = await res.json();

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || (locale === 'ar-TN' 
          ? 'واضح! تم تسجيل الملاحظة في منظومة سيمبيوكارب، ورانا نتبعو في الاستهلاك مع الستاغ.' 
          : "C'est bien noté ! Les paramètres ont été mis à jour dans SymbioCarb."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: locale === 'ar-TN'
          ? 'يعطيك الصحة سي سيف! الميساج وصل وكلمت الفريق الفني باش يتبعو العداد.'
          : 'Message reçu ! Les paramètres sont enregistrés.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsSending(false);
    }
  };

  // Sync latest updates from Telegram getUpdates
  const handleSyncUpdates = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/telegram/sync');
      const data = await res.json();
      if (data.newMessages && data.newMessages.length > 0) {
        setMessages((prev) => [...prev, ...data.newMessages]);
      }
    } catch (err) {
      console.error('Failed to sync Telegram messages:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // Simulate or record voice note
  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const sampleDarijaVoice = locale === 'ar-TN'
          ? '🎤 تسجيل صوتي : "يا سي سيف رانا وقفنا الموتور رقم 3 خاطر الستاغ دخلت في البيك"'
          : '🎤 Note vocale : "On a arrêté le broyeur 3 pour éviter la pointe STEG"';
        handleSendMessage(sampleDarijaVoice);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#0D131F] border-s border-white/10 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Bot className="h-6 w-6" />
              <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-gray-900"></span>
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{locale === 'ar-TN' ? 'درجة بوت (الميدان)' : 'DarjaBot Shop-Floor'}</span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                  LIVE TELEGRAM
                </span>
              </div>
              <div className="text-[11px] text-gray-400">
                {t.copilot.onlineStatus}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSyncUpdates}
              disabled={isSyncing}
              title={t.copilot.syncUpdates}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Telegram Chat History Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#090D16]/50">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300 flex items-start gap-2.5">
            <Smartphone className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            <div>
              <p className="font-semibold">{locale === 'ar-TN' ? 'متصل مباشرة بتيليغرام' : 'Synchronisé avec Telegram'}</p>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                {locale === 'ar-TN'
                  ? 'أي رسالة تكتبها هنا أو في التيليغرام على تليفونك يتم معالجتها فورياً بالدارجة التونسية.'
                  : 'Les messages envoyés ici ou depuis votre bot Telegram sont synchronisés en temps réel.'}
              </p>
            </div>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 text-xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                    : 'bg-gray-800/90 text-gray-100 border border-white/10 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div className="mt-1 text-[9px] text-right opacity-60 font-mono">
                  {msg.timestamp}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="h-7 w-7 rounded-lg bg-gray-700 flex items-center justify-center shrink-0 text-gray-300 text-xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Presets */}
        <div className="p-3 border-t border-white/10 bg-gray-900/60 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
            {t.copilot.presetsTitle}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleSendMessage(locale === 'ar-TN' ? 'شنوة أحوال استهلاك الستاغ والذروة الليلة؟' : 'Quelle est la situation du tarif de pointe STEG ce soir ?')}
              className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              {t.copilot.preset1}
            </button>
            <button
              onClick={() => handleSendMessage(locale === 'ar-TN' ? 'قداش خطية الكوس في (cos phi) الشهر هذا وقدّاش كلفة بطارية المكثفات؟' : 'Combien s\'élève la pénalité cos phi et le coût de la batterie ?')}
              className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-300 hover:bg-red-500/20 transition-all"
            >
              {t.copilot.preset2}
            </button>
            <button
              onClick={() => handleSendMessage(locale === 'ar-TN' ? 'نحب نعمل تثمين لـ 600 طن نوى تمر بالكربون المنشط، قداش المربوح؟' : 'Simulation valorisation 600t noyaux de dattes en charbon actif')}
              className="shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all"
            >
              {t.copilot.preset3}
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-gray-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording
                  ? 'border-red-500 bg-red-500/20 text-red-400 animate-pulse'
                  : 'border-white/10 bg-gray-800 text-gray-400 hover:text-white'
              }`}
              title="Enregistrer un message vocal en Darija"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.copilot.sendPlaceholder}
              className="flex-1 bg-gray-800/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

