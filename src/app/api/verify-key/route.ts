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
    const genAI = new GoogleGenerativeAI(cleanKey);

    // Use gemini-1.5-flash with a minimal generateContent call to safely test access
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple verification request
    await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      generationConfig: { maxOutputTokens: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Log actual server error to Vercel logs so you can inspect it if needed
    console.error('API Key Verification Error:', error);

    const errorMessage = error?.message || error?.toString() || '';
    const statusCode = error?.status || error?.statusCode;

    // Quota exhaustion check
    if (statusCode === 429 || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'Rate limit hit — your free tier quota may be exhausted. Try again after midnight PT.' },
        { status: 429 }
      );
    }

    // Invalid key check
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

    // Return the actual error message sent by Google or runtime instead of masking it
    return NextResponse.json(
      { error: `Verification error: ${errorMessage || 'Unknown error occurred.'}` },
      { status: 500 }
    );
  }
}
