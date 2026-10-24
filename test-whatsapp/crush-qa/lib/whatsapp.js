// WhatsApp sending for two providers.
//   callmebot: free, but only delivers to YOUR own number (owner notifications).
//   twilio:    can deliver to you AND to her (she must have opted in, see README).

const digits = (n) => String(n || '').replace(/\D/g, '');
const validPhone = (n) => {
  const d = digits(n);
  return d.length >= 8 && d.length <= 15;
};
const clean = (v, max) => String(v || '').trim().slice(0, max);
const provider = () => (process.env.WHATSAPP_PROVIDER || 'callmebot').toLowerCase();
const canMessageHer = () => provider() === 'twilio';

async function send(to, text) {
  const d = digits(to);
  const body = String(text).slice(0, 1500);

  if (provider() === 'twilio') {
    const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_WHATSAPP_FROM: from } = process.env;
    if (!sid || !token || !from) throw new Error('Twilio is not configured');
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: `whatsapp:+${d}`, From: from, Body: body }).toString(),
    });
    if (!r.ok) throw new Error('Twilio error ' + r.status + ': ' + (await r.text()).slice(0, 200));
    return;
  }

  // callmebot
  if (d !== digits(process.env.OWNER_WHATSAPP)) throw new Error('callmebot can only message the owner');
  if (!process.env.CALLMEBOT_APIKEY) throw new Error('CALLMEBOT_APIKEY is not set');
  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${d}` +
    `&text=${encodeURIComponent(body)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error('Could not connect to CallMeBot. Please try again.');
  }

  const responseText = (await response.text()).trim();
  if (!response.ok || !responseText.toLowerCase().includes('message queued')) {
    throw new Error(
      'CallMeBot did not accept the message. Check your API key, WhatsApp number, and CallMeBot activation.'
    );
  }
}

const toOwner = (text) => send(process.env.OWNER_WHATSAPP, text);
const toHer = (phone, text) => send(phone, text);

module.exports = { digits, validPhone, clean, canMessageHer, toOwner, toHer };
