function json(response, statusCode = 200) {
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function escapeText(value = '') {
  return String(value).replace(/[<>]/g, '');
}

function formatTelegramMessage(lead) {
  const utm = lead.utm || {};
  return [
    'Новая заявка с сайта',
    '',
    `Имя: ${escapeText(lead.name)}`,
    `Телефон: ${escapeText(lead.phone)}`,
    `Услуга: ${escapeText(lead.service)}`,
    `Комментарий: ${escapeText(lead.message)}`,
    '',
    `Страница: ${escapeText(lead.page)}`,
    `UTM source: ${escapeText(utm.utm_source || '')}`,
    `UTM medium: ${escapeText(utm.utm_medium || '')}`,
    `UTM campaign: ${escapeText(utm.utm_campaign || '')}`,
  ].join('\n');
}

async function sendTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: true };

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: formatTelegramMessage(lead) }),
  });

  if (!response.ok) throw new Error('Telegram request failed');
  return { ok: true };
}

async function sendBitrix(lead) {
  const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };

  const utm = lead.utm || {};
  const url = webhookUrl.endsWith('/')
    ? `${webhookUrl}crm.lead.add.json`
    : `${webhookUrl}/crm.lead.add.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        TITLE: `Заявка с сайта: ${lead.service || 'ремонт и строительство под ключ'}`,
        NAME: lead.name || 'Клиент с сайта',
        PHONE: [{ VALUE: lead.phone || '', VALUE_TYPE: 'WORK' }],
        COMMENTS: [
          `Услуга: ${lead.service || ''}`,
          `Комментарий: ${lead.message || ''}`,
          `Страница: ${lead.page || ''}`,
        ].join('\n'),
        SOURCE_ID: 'WEB',
        UTM_SOURCE: utm.utm_source || '',
        UTM_MEDIUM: utm.utm_medium || '',
        UTM_CAMPAIGN: utm.utm_campaign || '',
        UTM_CONTENT: utm.utm_content || '',
        UTM_TERM: utm.utm_term || '',
      },
      params: { REGISTER_SONET_EVENT: 'Y' },
    }),
  });

  if (!response.ok) throw new Error('Bitrix request failed');
  return { ok: true };
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const lead = await request.json();
    if (!lead.phone) return json({ error: 'Phone is required' }, 400);

    const [telegram, bitrix] = await Promise.all([sendTelegram(lead), sendBitrix(lead)]);
    return json({ ok: true, telegram, bitrix });
  } catch (error) {
    return json({ error: 'Lead processing failed' }, 500);
  }
}
