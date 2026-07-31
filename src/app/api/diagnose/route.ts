import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required for diagnosis." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured in server environment variables." },
        { status: 500 }
      );
    }

    // Extract dynamic MIME type (e.g., image/png, image/jpeg, image/webp)
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
      { error: error.message || "Failed to analyze image." },
      { status: 500 }
    );
  }
}
