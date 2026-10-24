const crypto = require('crypto');
const { validPhone, clean, canMessageHer, toHer } = require('../lib/whatsapp');

function samePassword(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  if (!process.env.ADMIN_PASSWORD || !samePassword(body.password || '', process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Wrong password.' });
  }

  const to = clean(body.to, 24);
  const question = clean(body.question, 1000);
  const reply = clean(body.reply, 3000);

  if (!validPhone(to)) return res.status(400).json({ error: 'Add her WhatsApp number with country code.' });
  if (!reply) return res.status(400).json({ error: 'Write your answer first.' });

  // CallMeBot cannot message her, so the page opens WhatsApp for you to tap send.
  if (!canMessageHer()) return res.status(200).json({ ok: true, manual: true });

  try {
    await toHer(to, `You asked:\n_${question}_\n\n${reply}`);
  } catch (err) {
    console.error(err);
    return res.status(200).json({ ok: true, manual: true, note: 'Automatic sending failed.' });
  }

  res.status(200).json({ ok: true, manual: false });
};
