const crypto = require('crypto');
const { isPortalOpen, setPortalOpen } = require('../lib/portal');

function samePassword(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      return res.status(200).json({ open: await isPortalOpen() });
    } catch (err) {
      console.error(err);
      return res.status(503).json({ error: 'Portal status is temporarily unavailable.' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  if (!process.env.ADMIN_PASSWORD || !samePassword(body.password || '', process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Wrong password.' });
  }
  if (typeof body.open !== 'boolean') {
    return res.status(400).json({ error: 'Choose whether to open or close the portal.' });
  }

  try {
    await setPortalOpen(body.open);
    return res.status(200).json({ ok: true, open: body.open });
  } catch (err) {
    console.error(err);
    return res.status(503).json({ error: 'Could not update the portal. Check the storage configuration and try again.' });
  }
};
