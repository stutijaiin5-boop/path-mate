import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, originalRoadmap, completedTasks, missedTasks, missedDays, hoursPerDay, deadline, currentDate, currentLevel } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const prompt = `You are an Adaptive Execution Coach — a supportive AI that helps students get back on track when life gets busy.

    The user has missed ${missedDays} days. Your job is to intelligently rebuild their remaining roadmap.

    NEVER shame the user. Be supportive. Preserve completed work. Intelligently compress and optimize what remains.

    Original goal: "${goal}"
    Current level: ${currentLevel}
    Hours available per day: ${hoursPerDay}
    Original deadline: ${deadline}
    Current date: ${currentDate}
    Total days in original roadmap: ${originalRoadmap.totalDays}

    Completed tasks: ${JSON.stringify(completedTasks)}
    Missed tasks: ${JSON.stringify(missedTasks)}

    Return ONLY valid JSON (no markdown, no extra text) with this structure:
    {
      "roadmap": {
        "phases": [{ "id": "phase_0", "title": "...", "weekRange": "Week 1", "startDay": 1, "endDay": 7, "description": "...", "milestone": "..." }],
        "days": [{ "day": 1, "date": "YYYY-MM-DD", "phaseId": "phase_0", "tasks": [{ "id": "day1_task0", "title": "...", "estimatedTime": number, "category": "study|practice|networking|personal", "completed": false, "date": "YYYY-MM-DD", "day": number, "phaseId": "phase_0" }], "completed": false, "focus": "..." }],
        "totalDays": number,
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD"
      },
      "changes": ["string describing what was changed"],
      "summary": "A supportive message for the user"
    }

    Guidelines:
    - Preserve all completed tasks from originalRoadmap's taskHistory
    - Intelligently merge similar tasks where possible
    - Compress revision days
    - Remove unnecessary buffer days
    - Rebalance workload evenly across remaining days
    - Maintain logical learning order from the original roadmap
    - Respect hoursPerDay (convert to minutes, max hoursPerDay * 60 minutes per day)
    - Only extend the deadline if absolutely necessary
    - Keep the startDate the same as the original
    - Generate realistic, specific task titles related to their goal
    - Keep 2-4 tasks per day max
    - Task estimatedTime should be 20-60 minutes each`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to replan roadmap' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No content in Groq response' }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse Groq response' }, { status: 500 });
      }
    }

    for (const day of result.roadmap.days) {
      for (const task of day.tasks) {
        const origDay = originalRoadmap.days.find((d: { date: string }) => d.date === task.date);
        if (origDay) {
          const origTask = origDay.tasks.find((t: { title: string }) => t.title === task.title);
          if (origTask) {
            task.id = origTask.id;
          }
        }
        if (task.id && originalRoadmap.taskHistory?.[`${task.date}_${task.id}`]) {
          task.completed = true;
        }
      }
    }

    return NextResponse.json({
      roadmap: result.roadmap,
      changes: result.changes || ['Your roadmap has been optimized to match your current pace.'],
      summary: result.summary || "You're back on track! Here's your updated plan.",
    });
  } catch (error) {
    console.error('Error in replan-roadmap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
