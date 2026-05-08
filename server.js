const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/research', async (req, res) => {
  const { org, sector } = req.body;
  
  const prompt = `You are helping write personalised cold outreach emails for Red Mountain Films, a South Wales documentary and commercial video production company. Research the following organisation and write 1-2 short personalised sentences (max 40 words total) to open a cold outreach email. Focus on something specific and recent about the COMPANY - a recent project, initiative, milestone, campaign, news story, or strategic priority. Keep it natural and genuine. Do not mention Red Mountain Films. Do not use generic openers like "I came across your organisation". Be specific.\n\nOrganisation: ${org}\nSector: ${sector}\n\nRespond with ONLY the 1-2 sentences. No preamble.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const textBlock = data.content && data.content.find(b => b.type === 'text');
    const result = textBlock ? textBlock.text.trim() : "I've been following your recent work with great interest.";
    res.json({ personalisation: result });
  } catch (err) {
    console.error(err);
    res.json({ personalisation: "I've been following your recent work with great interest." });
  }
});

app.get('/', (req, res) => res.send('Outreach backend running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
