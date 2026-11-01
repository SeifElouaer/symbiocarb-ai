// ==============================================================================
// Telegram Notification Templates & Formatting in Tunisian Darija & French
// ==============================================================================

import { TelegramInlineButton } from './client';

export function formatPointeWarningMessage(locale: string = 'ar-TN'): { text: string; buttons: TelegramInlineButton[][] } {
  if (locale === 'ar-TN') {
    return {
      text: `🚨 <b>تنبيه عاجل : تعريفة الذروة للستاغ (Tarif Pointe) تبدا بعد 15 دقيقة!</b>

يا سي سيف، سعر الكيلوواط ساعة باش يطلع لـ <b>0.412 دينار</b> (من 19:00 إلى 22:00).
⚠️ الماكينات غير الحيوية (الرحى رقم 2 أو مضخات الغسيل) تنجم توقفها توا باش نربحو <b>140 دينار</b> اليوم.

📉 <i>الهدف : خفض الحمل بـ 45 كيلوواط وتفادي خطية تجاوز القدرة المكتتبة (Dépassement).</i>`,
      buttons: [
        [
          { text: '✅ تم توقيف الماكينات (45 kW)', callback_data: 'ack_shedding_done' },
          { text: '📊 مراقبة العداد توا', callback_data: 'check_meter_now' },
        ],
        [
          { text: '🏭 فتح لوحة القيادة', callback_data: 'view_energy_cockpit' },
        ],
      ],
    };
  }

  return {
    text: `🚨 <b>ALERTE STEG : Entrée en Tarif de Pointe dans 15 minutes !</b>

Le tarif du kWh passe à <b>0.412 TND</b> (créneau 19h00 - 22h00).
Recommandation : déclenchez l'effacement de 45 kW sur les broyeurs non prioritaires pour économiser <b>140 TND</b> ce soir.`,
    buttons: [
      [
        { text: '✅ Délester 45 kW', callback_data: 'ack_shedding_done' },
        { text: '📊 Voir Compteur MT', callback_data: 'check_meter_now' },
      ],
      [
        { text: '🏭 Ouvrir Cockpit Énergie', callback_data: 'view_energy_cockpit' },
      ],
    ],
  };
}

export function formatCosPhiAlertMessage(cosPhi: number, penaltyTnd: number, locale: string = 'ar-TN') {
  if (locale === 'ar-TN') {
    return {
      text: `⚠️ <b>تنبيه فني : هبوط حاد في معامل القدرة (cos φ = ${cosPhi})</b>

الستاغ سجلت خطية طاقة ارتكاسية بقيمة <b>${penaltyTnd.toLocaleString('fr-TN')} دينار</b> هذا الشهر.
💡 الحل الهندسي : تركيب بطارية مكثفات سعة 150 kVAR يربح المعمل 45,000 دينار سنوياً ويسترجع كلفته في 4 أشهر فقط.`,
      buttons: [
        [{ text: '📑 طلب دراسة التعويض (ANME FTE)', callback_data: 'request_anme_study' }],
        [{ text: '📱 التحدث مع مهندس درجة بوت', callback_data: 'chat_darjabot' }],
      ],
    };
  }

  return {
    text: `⚠️ <b>Alerte Technique : Facteur de puissance dégradé (cos φ = ${cosPhi})</b>

Pénalité réactive STEG estimée à <b>${penaltyTnd.toLocaleString('fr-FR')} TND</b>.
Une batterie de condensateurs compenserait immédiatement cette redevance avec un retour sur investissement en moins de 5 mois.`,
    buttons: [
      [{ text: '📑 Dossier Subvention ANME', callback_data: 'request_anme_study' }],
      [{ text: '🏭 Voir Simulateur cos φ', callback_data: 'view_cos_phi_sim' }],
    ],
  };
}

export function formatSymbiosisMatchAlert(wasteTitle: string, buyerName: string, potentialGainTnd: number, locale: string = 'ar-TN') {
  if (locale === 'ar-TN') {
    return {
      text: `🌿 <b>بشرى ممتازة : تم العثور على شريك صناعي لتثمين المخلفات!</b>

المشتري : <b>${buyerName}</b>
المادة : <b>${wasteTitle}</b>
💰 المربوح السنوي الصافي المقدر : <b>${potentialGainTnd.toLocaleString('fr-TN')} دينار</b>
🌍 خفض الانبعاثات : تجنب 940 طن من مكافئ ثاني أكسيد الكربون.`,
      buttons: [
        [{ text: '🤝 قبول العرض وبدء التواصل', callback_data: 'accept_symbiosis_lead' }],
        [{ text: '🗺️ عرض المسار في الخريطة', callback_data: 'view_symbiosis_map' }],
      ],
    };
  }

  return {
    text: `🌿 <b>Nouvelle Synergie Circulaire Détectée !</b>

Acheteur : <b>${buyerName}</b>
Gisement : <b>${wasteTitle}</b>
Gain net estimé : <b>${potentialGainTnd.toLocaleString('fr-FR')} TND / an</b>.`,
    buttons: [
      [{ text: '🤝 Contacter l\'acheteur', callback_data: 'accept_symbiosis_lead' }],
      [{ text: '🗺️ Voir sur la Carte 3D', callback_data: 'view_symbiosis_map' }],
    ],
  };
}

