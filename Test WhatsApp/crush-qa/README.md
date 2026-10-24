# Pass me a note (WhatsApp edition)

A romantic Q&A site. Everything lands on WhatsApp. No database needed.

- She answers your questions ONE AT A TIME with a mood emoji. Each answer goes to your WhatsApp right away.
- Your answer to that question appears on her screen immediately. With the Twilio provider it also goes to her WhatsApp.
- She can react to your answers with emojis (sent with her next answer) and leave a note at the end.
- A second tab lets her ask you questions. You get a WhatsApp message with an "Answer her here" link. Your answer goes to her WhatsApp.

## 1. Edit your content
Open `lib/questions.js` and change the questions and your own answers.

## 2. Choose a WhatsApp provider (set WHATSAPP_PROVIDER)

### Option A: callmebot (free, easiest, messages YOU only)
1. Follow the activation steps at https://www.callmebot.com/blog/free-api-whatsapp-messages/ with your own number. You receive an API key.
2. Set `WHATSAPP_PROVIDER=callmebot`, `OWNER_WHATSAPP` (international format) and `CALLMEBOT_APIKEY`.
3. Her answers and questions arrive on your WhatsApp. Your answers are shown on her screen. When you answer her questions, `/reply.html` opens WhatsApp with the message ready and you tap send.

### Option B: twilio (can also message HER)
1. Create a Twilio account and open Messaging > Try it out > Send a WhatsApp message.
2. Set `WHATSAPP_PROVIDER=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (sandbox: `whatsapp:+14155238886`).
3. Also join the sandbox yourself so you receive messages: send the join code from the Twilio page to the sandbox number.
4. Limits to know: with the sandbox, she must also send the join code first before she can receive anything. For real use you need an approved WhatsApp sender, and WhatsApp only allows free-form messages within 24 hours of the person last messaging you (otherwise approved templates are required). If delivery to her fails, the site still works: her screen shows your answers, and you can use "Open in WhatsApp instead" on the reply page.

## 3. Deploy to Vercel
1. Push this folder to GitHub and import it at https://vercel.com/new (or run `npx vercel`).
2. Create an Upstash Redis database and connect it to the Vercel project. The integration provides `KV_REST_API_URL` and `KV_REST_API_TOKEN` for the persistent portal setting.
3. Add every key from `.env.example` under Project > Settings > Environment Variables. For CallMeBot, set `WHATSAPP_PROVIDER=callmebot`, `OWNER_WHATSAPP`, `CALLMEBOT_APIKEY`, and a unique `ADMIN_PASSWORD`. Vercel does not read your local `.env`; add secrets directly in the Vercel dashboard.
4. Redeploy and send her the link.

## Admin portal control
Open `/admin.html` and enter the `ADMIN_PASSWORD` to open or close the visitor portal. The portal status is stored in Upstash Redis, and visitor submissions are also rejected server-side while it is closed.

## Test locally
`npm install -g vercel`, then `vercel dev` in this folder.

## Notes
- Never commit `.env`.
- Your answers live only on the server and reach her browser one at a time, after she answers that question.
- Only send WhatsApp messages to people who have agreed to receive them.
