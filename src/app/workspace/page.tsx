"use client";

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function WorkspacePage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        localStorage.getItem("gemini_api_key") ||
        "";

      if (!apiKey) {
        throw new Error("Gemini API key is missing. Please configure your key in settings or .env.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const base64Data = image.includes(",") ? image.split(",")[1] : image;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      };

      const prompt =
        "Diagnose this repair issue from the image and provide clear, step-by-step instructions to fix it.";

      const response = await model.generateContent([prompt, imagePart]);
      const responseText = await response.response.text();

      setResult(responseText);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setError(err.message || "An error occurred while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-6">
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-8">
        <h1 className="text-xl font-bold text-gray-900">FixIt AI</h1>
      </header>

      <main className="max-w-5xl mx-auto space-y-6">
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          {image && (
            <div className="relative mt-4 max-w-md mx-auto">
              <div className="relative rounded-2xl overflow-hidden bg-orange-500 p-2 shadow-lg">
                <img
                  src={image}
                  alt="Upload preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={handleDiagnose}
                  disabled={loading}
                  className="w-full text-left pt-3 pb-1 px-3 text-white font-medium text-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Diagnosing..." : "Diagnose this issue"}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-white rounded-lg text-red-600 text-sm font-sans shadow-sm border border-gray-100">
            {error}
          </div>
        )}

        {result && (
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-800 space-y-4">
            <h2 className="text-xl font-semibold">Diagnosis Result</h2>
            <div className="prose max-w-none whitespace-pre-line">{result}</div>
          </div>
        )}
      </main>
    </div>
  );
}
