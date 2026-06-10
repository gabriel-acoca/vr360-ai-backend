// api/vr360-vision.js  — à déposer dans /api/ du projet vr360-ai-backend sur Vercel
// Reçoit un screenshot base64 du canvas krpano, renvoie une description en langue demandée

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Directions en clair pour contextualiser la description
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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, mediaType = 'image/jpeg', scene, heading = 0, fov = 90, language = 'fr', languageName = 'French' } = req.body || {};

  if (!image || image.length < 100) {
    return res.status(400).json({ error: 'Missing or empty image data' });
  }

  const dirCode  = headingToDir(heading);
  const dirs     = DIR_LABELS[language] || DIR_LABELS.fr;
  const dirLabel = dirs[dirCode] || dirCode;

  const prompt = [
    `You are an expert audio guide for visually impaired visitors of the Opéra Garnier (Palais Garnier) in Paris.`,
    ``,
    `The visitor is currently in: **${scene}**.`,
    `They are facing: **${dirLabel}** (${heading}°). Field of view: ${fov}°.`,
    ``,
    `Describe PRECISELY and ONLY what is visible in this screenshot of the 360° virtual tour.`,
    `Do NOT describe what is generally found in this room — describe what is actually IN THIS IMAGE.`,
    `Focus on: specific architectural details visible, sculptures, decorative elements, colors, materials, light sources, depth and perspective.`,
    `If a specific artwork or object is clearly identifiable (statue, painting, chandelier, column type...), name it.`,
    ``,
    `Answer in ${languageName}. Maximum 4 sentences. Start directly with the description, no preamble.`,
  ].join('\n');

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',   // vision disponible sur tous les modèles récents
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
    });

    const description = (response.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join(' ')
      .trim();

    if (!description) throw new Error('Empty response from Claude');

    return res.status(200).json({ reply: description });

  } catch (err) {
    console.error('[vr360-vision] Claude API error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
