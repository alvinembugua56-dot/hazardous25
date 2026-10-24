const { QUESTIONS } = require('../lib/questions');
const { isPortalOpen } = require('../lib/portal');

// Sends only the questions, never your answers.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    res.status(200).json({
      ownerName: process.env.OWNER_NAME || 'Me',
      questions: QUESTIONS.map((x) => x.q),
      open: await isPortalOpen(),
    });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Portal status is temporarily unavailable.' });
  }
};
