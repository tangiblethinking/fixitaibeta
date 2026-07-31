import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const rawImage = body?.image || body?.imageData || body?.base64;
    if (!rawImage) {
      return NextResponse.json(
        { error: "Image data is required for diagnosis." },
        { status: 400 }
      );
    }

    // Server-side env key strictly takes priority over client-supplied keys
    const envApiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const clientApiKey = req.headers.get("x-api-key") || body?.apiKey;

    const apiKey = (envApiKey && envApiKey.trim() !== "" ? envApiKey : clientApiKey)?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is missing. Please save an API key in settings or configure GEMINI_API_KEY." },
        { status: 400 }
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
    const candidates = response.response.candidates;

    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "Diagnosis was blocked by safety filters or produced no response." },
        { status: 422 }
      );
    }

    let responseText = "";
    try {
      responseText = await response.response.text();
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || "Failed to extract text response from model generation." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error("Diagnosis API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze repair image." },
      { status: 500 }
    );
  }
}
