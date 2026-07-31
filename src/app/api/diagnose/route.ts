import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // Accept image data under 'image', 'imageData', or 'base64'
    const rawImage = body?.image || body?.imageData || body?.base64;

    if (!rawImage) {
      return NextResponse.json(
        { error: "Image data is required for diagnosis." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing in environment variables." },
        { status: 500 }
      );
    }

    let mimeType = "image/jpeg";
    let base64Data = rawImage;

    if (rawImage.includes(";base64,")) {
      const parts = rawImage.split(";base64,");
      mimeType = parts[0].replace("data:", "") || "image/jpeg";
      base64Data = parts[1];
    } else if (rawImage.includes(",")) {
      base64Data = rawImage.split(",")[1];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const userPrompt =
      body?.prompt ||
      "Diagnose this home repair issue from the image and provide clear, step-by-step DIY instructions to fix it.";

    const response = await model.generateContent([userPrompt, imagePart]);
    const responseText = await response.response.text();

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error("Diagnosis API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze repair image." },
      { status: 500 }
    );
  }
}
