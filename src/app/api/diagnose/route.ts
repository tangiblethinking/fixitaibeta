import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const headerKey = req.headers.get('x-api-key');
    const formData = await req.formData();
    const bodyKey = formData.get('apiKey') as string | null;
    
    const activeApiKey = process.env.GEMINI_API_KEY || headerKey || bodyKey;

    if (!activeApiKey) {
      return NextResponse.json(
        { error: 'No API key found. Please set up your key in Settings.' },
        { status: 400 }
      );
    }

    const imageFile = formData.get('image') as File | null;
    const message = (formData.get('message') as string) || 'Diagnose this home repair issue.';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided for diagnosis.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    const result = await model.generateContent([
      message,
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type || 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();

    return NextResponse.json({
      diagnosis: {
        title: 'Home Repair Diagnosis',
        summary: responseText,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process diagnosis.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
