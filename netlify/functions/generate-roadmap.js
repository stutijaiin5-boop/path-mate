const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000*60*60*24));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GROQ_API_KEY not set' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { goal, level, hours, deadline, commitments } = body;
  if (!goal || !deadline) {
    return { statusCode: 400, body: JSON.stringify({ error: 'goal and deadline required' }) };
  }

  const totalDays = Math.max(daysBetween(todayStr(), deadline), 1);

  const systemPrompt = `You are a student goal-planning expert. Generate a structured day-wise roadmap.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "phases": [
    {
      "name": "Phase name",
      "days": [
        {
          "day": 0,
          "date": "YYYY-MM-DD",
          "tasks": [
            {
              "title": "Task title",
              "time": 30,
              "cat": "Study|Practice|Networking|Personal",
              "done": false
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- The first day (day 0) starts with today's date: "${todayStr()}".
- Generate exactly ${totalDays} days (day 0 through day ${totalDays - 1}).
- Each day should have 2-5 tasks depending on available hours.
- Group days into meaningful phases (3-6 phases total depending on duration).
- Tasks must be specific, actionable, and relevant to the user's goal.
- Each task has a "cat" field: one of Study, Practice, Networking, Personal.
- Time estimates in minutes (15-60 range).
- All tasks start with "done": false.
- Dates must be consecutive (YYYY-MM-DD format).`;

  const userPrompt = `User's goal: "${goal}"
Current level: ${level}
Hours available per day: ${hours}
Target deadline: ${deadline}
Current commitments: ${commitments && commitments.length > 0 ? commitments.join(', ') : 'None'}

Generate the complete ${totalDays}-day roadmap as JSON.`;

  try {
    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      })
    });

    if (!resp.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: `Groq API error: ${resp.status}` }) };
    }

    const data = await resp.json();
    let raw = data.choices[0].message.content;
    raw = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(raw);

    if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Invalid roadmap structure from Groq' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
