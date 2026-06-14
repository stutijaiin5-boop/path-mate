const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_TYPE_CONFIG = {
  college: { icon: '🎓', label: 'College Day', maxHours: 8 },
  free:    { icon: '📖', label: 'Free Day',    maxHours: 8 },
  partial: { icon: '⚡', label: 'Partial Day',  maxHours: 8 },
  off:     { icon: '😴', label: 'Off',          maxHours: 0 },
};

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / (1000*60*60*24));
}

function buildWeekSchedule(weekData) {
  if (!weekData || !Array.isArray(weekData) || weekData.length < 7) return '';
  return weekData.map((entry, i) => {
    const cfg = DAY_TYPE_CONFIG[entry.type] || DAY_TYPE_CONFIG.free;
    return `${DAY_NAMES[i]}: ${cfg.icon} ${cfg.label} — ${entry.hours}hr available`;
  }).join('\n');
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

  const { goal, level, hours, deadline, commitments, weekData } = body;
  if (!goal || !deadline) {
    return { statusCode: 400, body: JSON.stringify({ error: 'goal and deadline required' }) };
  }

  const totalDays = Math.max(daysBetween(todayStr(), deadline), 1);

  const weekSchedule = buildWeekSchedule(weekData);

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
- Group days into meaningful phases (3-6 phases total depending on duration).
- Tasks must be specific, actionable, and relevant to the user's goal.
- Each task has a "cat" field: one of Study, Practice, Networking, Personal.
- Time estimates in minutes (15-90 range).
- All tasks start with "done": false.
- Dates must be consecutive (YYYY-MM-DD format).

IMPORTANT — Weekly schedule (day of week → available hours):
${weekSchedule}

Adjust task count and total task time per day based on available hours:
- 0hr → no tasks (day off)
- 1hr → 1-2 short tasks (≤60min total)
- 2hr → 2-3 tasks (≤120min total)
- 3-4hr → 2-4 tasks (≤240min total)
- 5-6hr → 3-5 tasks (≤360min total)
- 7-8hr → 4-6 tasks (≤480min total)

Distribute weekly task load respecting each day's type and capacity. For "Off" days assign zero tasks.`;

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
