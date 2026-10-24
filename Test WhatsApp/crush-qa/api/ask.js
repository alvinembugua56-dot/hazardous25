const { digits, validPhone, clean, toOwner } = require('../lib/whatsapp');
const { requirePortalOpen } = require('../lib/portal');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  if (body.website) return res.status(200).json({ ok: true });
  if (!(await requirePortalOpen(res))) return;

  const name = clean(body.name, 80) || 'Someone';
  const phone = clean(body.phone, 24);
  const question = clean(body.question, 1000);
  const mood = clean(body.mood, 8);

  if (!question) return res.status(400).json({ error: 'Write your question first.' });
  if (phone && !validPhone(phone)) {
    return res.status(400).json({ error: 'Enter your WhatsApp number with country code, like +1 555 123 4567.' });
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const params = new URLSearchParams({ q: question, name });
  if (phone) params.set('to', '+' + digits(phone));
  const link = `${proto}://${req.headers.host}/reply.html?${params.toString()}`;

  try {
    await toOwner(
      `❓ *${name}* ${mood} asked you:\n\n${question}\n\n` +
        (phone ? `Her WhatsApp: +${digits(phone)}\n` : 'She did not leave a number, so you cannot reply to her.\n') +
        `\nAnswer her here:\n${link}`
    );
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: err.message || 'Could not send right now. Please try again.' });
  }

  res.status(200).json({ ok: true });
};
