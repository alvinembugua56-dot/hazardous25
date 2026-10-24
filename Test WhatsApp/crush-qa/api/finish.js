const { digits, validPhone, clean, toOwner } = require('../lib/whatsapp');
const { requirePortalOpen } = require('../lib/portal');
const { QUESTIONS } = require('../lib/questions');

// Called once when she reaches the end: sends you her last reaction and closing note.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  if (!(await requirePortalOpen(res))) return;
  const name = clean(body.name, 80) || 'Someone';
  const phone = clean(body.phone, 24);
  const message = clean(body.message, 1000);
  const answered = Number.isInteger(body.answered) ? body.answered : 0;
  const r = body.reaction;

  if (phone && !validPhone(phone)) return res.status(400).json({ error: 'That number does not look right.' });

  let reactionLine = '';
  if (r && Number.isInteger(r.index) && r.index >= 0 && r.index < QUESTIONS.length && r.emoji) {
    reactionLine = `\n\nHer last reaction: ${clean(r.emoji, 8)} to ${QUESTIONS[r.index].q}`;
  }

  try {
    await toOwner(
      `🎉 *${name}* finished all your questions 💕\nShe answered ${answered}/${QUESTIONS.length}.${reactionLine}` +
        (message ? `\n\nHer note to you:\n${message}` : '') +
        (phone ? `\n\nHer WhatsApp: +${digits(phone)}` : '')
    );
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: err.message || 'Could not send right now. Please try again.' });
  }

  res.status(200).json({ ok: true });
};
