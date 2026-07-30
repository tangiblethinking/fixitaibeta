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

    // Initialize Google AI with the user's key
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Use gemini-1.5-flash for a lightweight validation check
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Count tokens on a short string to test the key without consuming heavy generation quota
    await model.countTokens('validation_test');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || '';
    const statusCode = error?.status || error?.statusCode;

    // Check specifically for rate limit / quota exhaustion (HTTP 429 or RESOURCE_EXHAUSTED)
    if (statusCode === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'Rate limit hit — your free tier quota may be exhausted. Try again after midnight PT.' },
        { status: 429 }
      );
    }

    // Check for invalid API key credential errors (HTTP 400/401/403 or API_KEY_INVALID)
    if (
      statusCode === 400 ||
      statusCode === 401 ||
      statusCode === 403 ||
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('API key not valid')
    ) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check the key you copied from Google AI Studio.' },
        { status: 400 }
      );
    }

    // Fallback for unexpected errors (e.g., network issues)
    return NextResponse.json(
      { error: 'Unable to verify key. Please double-check your connection and key format.' },
      { status: 500 }
    );
  }
}
