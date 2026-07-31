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
        throw new Error("No Gemini API key found. Please configure your API key.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Updated model to gemini-2.5-flash to fix 404 endpoint errors
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
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">FixIt AI Workspace</h1>

      <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        {image && (
          <div className="relative mt-4 max-w-md mx-auto">
            <img
              src={image}
              alt="Upload preview"
              className="rounded-lg shadow-md w-full object-cover max-h-80"
            />
            <button
              onClick={handleDiagnose}
              disabled={loading}
              className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? "Analyzing Repair Issue..." : "Diagnose this issue"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Diagnosis Result</h2>
          <div className="prose max-w-none whitespace-pre-line">{result}</div>
        </div>
      )}
    </div>
  );
}
