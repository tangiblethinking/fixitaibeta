import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a valid API key string.' },
        { status: 400 }
      );
    }

    const cleanKey = apiKey.trim();

    // Verify key directly against Google AI Studio via a lightweight REST request.
    // This bypasses SDK model-naming discrepancies completely.
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`,
      { method: 'GET' }
    );

    const data = await googleRes.json();

    if (!googleRes.ok) {
      const errorMsg = data?.error?.message || '';
      const status = googleRes.status;

      if (status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { error: 'Rate limit hit — your free tier quota may be exhausted. Try again after midnight PT.' },
          { status: 429 }
        );
      }

      if (status === 400 || status === 401 || status === 403 || errorMsg.includes('API_KEY_INVALID')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check the key you copied from Google AI Studio.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Google API Error: ${errorMsg || 'Failed to authenticate key.'}` },
        { status: status }
      );
    }

    // Key is valid and can query Google models
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Key Verification Error:', error);
    return NextResponse.json(
      { error: `Verification error: ${error?.message || 'Network error occurred.'}` },
      { status: 500 }
    );
  }
}
