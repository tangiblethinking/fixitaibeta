import { NextResponse } from 'next/server';
import { decryptApiKey } from '@/lib/encryption';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getModel } from '@/lib/models';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an expert home repair diagnostic AI. Your job is to examine photos or videos of home repair issues and provide accurate, actionable diagnoses.

BEHAVIOR:
- Diagnose immediately from what you see. Do not ask clarifying questions unless you genuinely cannot determine the issue.
- Be specific about the problem, root cause, and recommended fix.
- Always estimate difficulty honestly — don't oversimplify dangerous repairs.
- Cost estimates should reflect typical US retail pricing.

RESPOND WITH VALID JSON ONLY matching this exact structure:
{
  "diagnosis": {
    "summary": "One-paragraph description of what's wrong",
    "rootCause": "Why this happened",
    "recommendedTrade": "Plumber|Electrician|HVAC|General Contractor|Handyman|Roofer|Appliance Repair"
  },
  "parts": [
    {
      "name": "Part name",
      "specs": "Size, material, type specifications",
      "estimatedCost": "$X – $Y"
    }
  ],
  "difficulty": {
    "level": "Easy|Moderate|Hard|Expert",
    "score": 1-10,
    "explanation": "Why this difficulty level, what skills/tools needed"
  },
  "estimatedTotalCost": "$X – $Y",
  "assumptions": ["assumption 1", "assumption 2"],
  "videoSearchTerm": "search term for YouTube repair video",
  "estimatedProCost": "$X – $Y"
}

Do NOT include any text outside the JSON object. No markdown, no explanation, just the JSON.`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const message = formData.get('message') as string;
    const image = formData.get('image') as File | null;
    const videoUri = formData.get('videoUri') as string | null;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve and decrypt API key
    const supabase = createServiceRoleClient();
    const { data: keyRecord } = await supabase
      .from('api_keys')
      .select('encrypted_key, iv')
      .eq('user_id', userId)
      .single();

    if (!keyRecord) {
      return NextResponse.json(
        { error: 'No API key found. Please set up your key in Settings.' },
        { status: 400 }
      );
    }

    const apiKey = await decryptApiKey(keyRecord.encrypted_key, keyRecord.iv);
    const model = getModel('multimodal');

    // Build parts array for Gemini
    const parts: Array<Record<string, unknown>> = [];

    // Add system instruction
    parts.push({ text: SYSTEM_PROMPT });

    // Add user message
    if (message) {
      parts.push({ text: message });
    }

    // Add image if provided
    if (image) {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      parts.push({
        inlineData: {
          mimeType: image.type,
          data: base64,
        },
      });
      if (!message) {
        parts.push({ text: 'Diagnose this home repair issue.' });
      }
    }

    // Add video reference if provided
    if (videoUri) {
      parts.push({
        fileData: {
          mimeType: 'video/mp4',
          fileUri: videoUri,
        },
      });
      if (!message && !image) {
        parts.push({
          text: 'Diagnose this home repair issue from the video.',
        });
      }
    }

    // Call Gemini
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => null);
      if (geminiRes.status === 429) {
        return NextResponse.json(
          {
            error:
              'Daily quota reached. Your free API key resets at midnight Pacific Time.',
            retryAfter: 'midnight PT',
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error:
            errData?.error?.message || `Gemini error (${geminiRes.status})`,
        },
        { status: geminiRes.status }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON response
    try {
      const diagnosis = JSON.parse(rawText);
      return NextResponse.json({ diagnosis });
    } catch {
      // If JSON parsing fails, return raw text for debugging
      return NextResponse.json(
        { error: 'AI response was not valid JSON', rawText },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Diagnose error:', err);
    return NextResponse.json(
      { error: 'Server error during diagnosis' },
      { status: 500 }
    );
  }
}
