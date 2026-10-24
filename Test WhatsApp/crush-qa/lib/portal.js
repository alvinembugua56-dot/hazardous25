async function requestRedis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error('Portal storage is not configured.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    throw new Error(`Portal storage request failed with HTTP ${response.status}.`);
  }

  const result = await response.json();
  if (result.error) throw new Error('Portal storage returned an error.');
  return result.result;
}

async function isPortalOpen() {
  const value = await requestRedis(['GET', 'portal:open']);
  return value !== '0';
}

async function setPortalOpen(open) {
  const result = await requestRedis(['SET', 'portal:open', open ? '1' : '0']);
  if (result !== 'OK') throw new Error('Portal storage did not confirm the update.');
}

async function requirePortalOpen(res) {
  try {
    if (await isPortalOpen()) return true;
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'The portal is temporarily unavailable. Please try again later.' });
    return false;
  }

  res.status(403).json({ error: 'The portal is currently closed.' });
  return false;
}

module.exports = { isPortalOpen, setPortalOpen, requirePortalOpen };
