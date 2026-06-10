// api/vr360-vision.js — backend Vercel
// Utilise OpenRouter (comme vr360-chat.js) — pas d'appel direct à Anthropic

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const DIR_LABELS = {
  fr: { N:'nord', NE:'nord-est', E:'est', SE:'sud-est', S:'sud', SO:'sud-ouest', O:'ouest', NO:'nord-ouest' },
  en: { N:'north', NE:'northeast', E:'east', SE:'southeast', S:'south', SO:'southwest', O:'west', NO:'northwest' },
  de: { N:'Norden', NE:'Nordosten', E:'Osten', SE:'Südosten', S:'Süden', SO:'Südwesten', O:'Westen', NO:'Nordwesten' },
  es: { N:'norte', NE:'noreste', E:'este', SE:'sureste', S:'sur', SO:'suroeste', O:'oeste', NO:'noroeste' },
  it: { N:'nord', NE:'nord-est', E:'est', SE:'sud-est', S:'sud', SO:'sud-ovest', O:'ovest', NO:'nord-ovest' },
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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
  }

  const dirCode  = headingToDir(heading);
  const dirs     = DIR_LABELS[language] || DIR_LABELS.fr;
  const dirLabel = dirs[dirCode] || dirCode;

  const prompt = `You are describing a screenshot of a 360° virtual tour of the Opéra Garnier.
STRICT RULES:
1. Describe ONLY what you can literally see in this image. Nothing else.
2. Do NOT add historical context, anecdotes, or general knowledge.
3. Do NOT mention what is typically found in this room — only what is IN THIS IMAGE.
4. If you see a floor: describe its pattern, material, colors visible. Stop there.
5. If you see a sculpture: describe its shape, posture, material visible. Stop there.
6. Maximum 3 short sentences. Be concise and factual.
Context: room = ${scene}, facing ${dirLabel}.
Answer in ${languageName}. Start immediately with what you see.`;

  try {
    console.log('[vr360-vision] image size:', image.length, 'chars, scene:', scene);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.gabrielacoca.fr',
        'X-Title': 'VR360 Opera Garnier Vision',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mediaType};base64,${image}`,
                detail: 'high',
              },
            },
            { type: 'text', text: prompt },
          ],
        }],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    const responseText = await response.text();
    console.log('[vr360-vision] OpenRouter status:', response.status, responseText.substring(0, 150));

    if (!response.ok) {
      return res.status(500).json({ error: `OpenRouter error ${response.status}` });
    }

    const data = JSON.parse(responseText);
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      return res.status(500).json({ error: 'Empty response' });
    }

    return res.status(200).json({ reply: description });

  } catch (err) {
    console.error('[vr360-vision] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
