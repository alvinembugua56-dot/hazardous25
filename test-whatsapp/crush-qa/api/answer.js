const { digits, validPhone, clean, canMessageHer, toOwner, toHer } = require('../lib/whatsapp');
const { requirePortalOpen } = require('../lib/portal');
const { QUESTIONS } = require('../lib/questions');

// Called after she answers ONE question.
// Sends her answer to your WhatsApp, sends your answer to hers (Twilio only),
// and returns your answer so the page can reveal it right away.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  if (body.website) return res.status(200).json({ ok: true, answer: '' }); // honeypot for bots
  if (!(await requirePortalOpen(res))) return;

  const idx = Number.isInteger(body.index) ? body.index : -1;
  if (idx < 0 || idx >= QUESTIONS.length) return res.status(400).json({ error: 'Unknown question.' });

  const name = clean(body.name, 80) || 'Someone';
  const phone = clean(body.phone, 24);
  const answer = clean(body.answer, 1000);
  const mood = clean(body.mood, 8);
  const prev = body.prevReaction;

  if (!answer) return res.status(400).json({ error: 'Write your answer first.' });
  if (phone && !validPhone(phone)) {
    return res.status(400).json({ error: 'Enter your WhatsApp number with country code, like +1 555 123 4567.' });
  }

  const item = QUESTIONS[idx];
  const n = idx + 1;
  const total = QUESTIONS.length;

  let prevLine = '';
  if (prev && Number.isInteger(prev.index) && prev.index >= 0 && prev.index < total && prev.emoji) {
    prevLine = `\n\nShe reacted ${clean(prev.emoji, 8)} to your answer for: ${QUESTIONS[prev.index].q}`;
  }

  try {
    await toOwner(
      `💌 *${name}* ${mood} answered question ${n}/${total}\n\n*${item.q}*\n${answer}${prevLine}` +
        (phone ? `\n\nHer WhatsApp: +${digits(phone)}` : '')
    );
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: err.message || 'Could not send right now. Please try again.' });
  }

  // Her copy is a bonus: never block the page if it fails.
  let sentToHer = false;
  if (phone && canMessageHer()) {
    try {
      await toHer(phone, `Hi ${name} 💕 You answered question ${n}/${total}. Here's mine:\n\n*${item.q}*\n${item.a}`);
      sentToHer = true;
    } catch (err) {
      console.error(err);
    }
  }

  res.status(200).json({ ok: true, answer: item.a, whatsapp: sentToHer });
};
