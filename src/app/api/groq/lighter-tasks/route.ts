import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tasks } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are a supportive study coach. Given the following tasks for today, suggest lighter alternatives that reduce the workload. Keep fewer tasks, use shorter estimated times, and prefer "personal" or "study" categories over "practice" or "networking".

Return ONLY a JSON array of task objects (no markdown, no extra text). Each object should have: title (string), estimatedTime (number in minutes, 15-30), category (one of: "study", "practice", "personal").

Original tasks:
${JSON.stringify(tasks, null, 2)}

Respond with a JSON array of 1-3 lighter tasks.`;

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate lighter tasks' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content in Groq response' },
        { status: 500 }
      );
    }

    let lighterTasks;
    try {
      lighterTasks = JSON.parse(content);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        lighterTasks = JSON.parse(match[0]);
      } else {
        return NextResponse.json(
          { error: 'Failed to parse Groq response' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ tasks: lighterTasks });
  } catch (error) {
    console.error('Error generating lighter tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
