import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.image) {
      return NextResponse.json(
        { error: "Image data is required for diagnosis." },
        { status: 400 }
      );
    }

    const { image, prompt } = body;

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

    // Safely extract Base64 data and MIME type
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (image.includes(";base64,")) {
      const parts = image.split(";base64,");
      mimeType = parts[0].replace("data:", "") || "image/jpeg";
      base64Data = parts[1];
    } else if (image.includes(",")) {
      base64Data = image.split(",")[1];
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
      prompt ||
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
