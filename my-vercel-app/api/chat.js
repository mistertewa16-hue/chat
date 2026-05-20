import { Configuration } from 'openai'; // you can also use fetch directly

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing "message" in request body' });
  }

  // 👉 Pull secrets from Vercel Environment Variables
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.MODEL;               // e.g., "gpt-4o"
  const endpoint = process.env.OPENROUTER_API_URL; // e.g., "https://api.openrouter.ai/v1/chat/completions"

  if (!apiKey || !model || !endpoint) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }]
        // You can extend the payload with temperature, max_tokens, etc.
      })
    });

    const data = await response.json();

    // Forward the model's answer
    const answer = data.choices?.[0]?.message?.content ?? 'No response';
    return res.status(response.status).json({ response: answer });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err.message });
  }
}