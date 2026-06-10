// api/vr360-vision.js — backend Vercel
// Reçoit un screenshot base64 du canvas krpano, renvoie une description via Claude vision
// Aucune dépendance externe — utilise fetch natif (Node 18+)

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const DIR_LABELS = {
  fr: { N:'nord', NE:'nord-est', E:'est', SE:'sud-est', S:'sud', SO:'sud-ouest', O:'ouest', NO:'nord-ouest' },
  en: { N:'north', NE:'northeast', E:'east', SE:'southeast', S:'south', SO:'southwest', O:'west', NO:'northwest' },
};

function headingToDir(h) {
  const d = ((h % 360) + 360) % 360;
  if (d < 22.5 || d >= 337.5) return 'N';
  if (d < 67.5)  return 'NE';
  if (d < 112.5) return 'E';
  if (d < 157.5) return 'SE';
  if (d < 202.5) return 'S';
  if (d < 247.5) return 'SO';
  if (d < 292.5) return 'O';
  return 'NO';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    image,
    mediaType = 'image/jpeg',
    scene = 'Opéra Garnier',
    heading = 0,
    fov = 90,
    language = 'fr',
    languageName = 'French',
  } = req.body || {};

  if (!image || image.length < 100) {
    return res.status(400).json({ error: 'Missing or empty image data' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const dirCode  = headingToDir(heading);
  const dirs     = DIR_LABELS[language] || DIR_LABELS.fr;
  const dirLabel = dirs[dirCode] || dirCode;

  const prompt = [
    `You are an expert audio guide for visually impaired visitors of the Opéra Garnier (Palais Garnier) in Paris.`,
    ``,
    `The visitor is in: ${scene}.`,
    `They are facing: ${dirLabel} (${heading}°). Field of view: ${fov}°.`,
    ``,
    `Describe PRECISELY and ONLY what is visible in this screenshot of the 360° virtual tour.`,
    `Do NOT describe what is generally found in this room — describe what is actually visible IN THIS IMAGE.`,
    `Focus on: specific architectural details, sculptures, decorative elements, colors, materials, light, depth.`,
    `If a specific artwork or object is clearly identifiable, name it.`,
    ``,
    `Answer in ${languageName}. Maximum 4 sentences. Start directly with the description, no preamble.`,
  ].join('\n');

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: image },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[vr360-vision] Anthropic error:', response.status, errText);
      return res.status(500).json({ error: `Anthropic API error ${response.status}` });
    }

    const data = await response.json();
    const description = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join(' ')
      .trim();

    if (!description) {
      return res.status(500).json({ error: 'Empty response from Claude' });
    }

    return res.status(200).json({ reply: description });

  } catch (err) {
    console.error('[vr360-vision] Error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
