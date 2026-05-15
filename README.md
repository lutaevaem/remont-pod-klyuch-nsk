# remont-pod-klyuch-nsk

Managed static website for a construction and renovation service.

## Stack

- HTML, CSS, JavaScript
- Vercel serverless function for lead handling
- Telegram notification support
- Bitrix24 lead creation support

## Files

- `index.html` — landing page structure and SEO tags
- `styles.css` — responsive visual system
- `script.js` — front-end interactions and form submission
- `api/lead.js` — server-side lead handler for Telegram and Bitrix24
- `vercel.json` — Vercel routing config

## Environment variables for Vercel

Add these in Vercel Project Settings:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `BITRIX_WEBHOOK_URL`

The Bitrix webhook URL should look like a Bitrix24 incoming webhook base URL. Do not store real tokens in the repository.
