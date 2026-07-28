import { NextResponse } from 'next/server';
import { encryptApiKey } from '@/lib/encryption';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getModel } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { apiKey, userId } = await request.json();

    if (!apiKey || !userId) {
      return NextResponse.json(
        { error: 'API key and user ID are required' },
        { status: 400 }
      );
    }

    // Verify key by making a real Gemini API call
    const model = getModel('text_chat');
    const verifyUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const verifyRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with exactly: OK' }],
          },
        ],
        generationConfig: { maxOutputTokens: 5 },
      }),
    });

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => null);
      const errMsg =
        errData?.error?.message || `Gemini returned status ${verifyRes.status}`;

      if (verifyRes.status === 400) {
        return NextResponse.json(
          { error: 'Invalid API key. Double-check you copied the full key.' },
          { status: 400 }
        );
      }
      if (verifyRes.status === 429) {
        return NextResponse.json(
          {
            error:
              'Rate limit hit — your free tier quota may be exhausted. Try again after midnight PT.',
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Key verification failed: ${errMsg}` },
        { status: 400 }
      );
    }

    // Key is valid — encrypt and store
    const { encrypted, iv } = await encryptApiKey(apiKey);
    const supabase = createServiceRoleClient();

    // Upsert: replace any existing key for this user
    const { error: dbError } = await supabase.from('api_keys').upsert(
      {
        user_id: userId,
        encrypted_key: encrypted,
        iv,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (dbError) {
      console.error('DB error storing key:', dbError);
      return NextResponse.json(
        { error: 'Failed to store key. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verify key error:', err);
    return NextResponse.json(
      { error: 'Server error during verification' },
      { status: 500 }
    );
  }
}
