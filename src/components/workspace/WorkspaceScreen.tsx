"use client";

import React, { useState, useEffect } from "react";

interface WorkspaceScreenProps {
  userId?: string;
}

export default function WorkspaceScreen({ userId }: WorkspaceScreenProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  useEffect(() => {
    const savedKey =
      localStorage.getItem("gemini_api_key") ||
      localStorage.getItem("apiKey") ||
      "";
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    const trimmed = key.trim();
    localStorage.setItem("gemini_api_key", trimmed);
    localStorage.setItem("apiKey", trimmed);
    setApiKey(trimmed);
    setShowSettings(false);
  };

  const processAndSetImage = (file: File) => {
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        setImage(resizedBase64);
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setError("Failed to process selected image.");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async () => {
    if (!image || isProcessingImage) return;

    const activeApiKey =
      apiKey ||
      localStorage.getItem("gemini_api_key") ||
      localStorage.getItem("apiKey") ||
      "";

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": activeApiKey,
        },
        body: JSON.stringify({
          image: image,
          apiKey: activeApiKey,
          prompt: "Diagnose this home repair issue from the image and provide clear, step-by-step instructions to fix it.",
        }),
      });

      const rawText = await response.text();
      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `Server returned non-JSON error (${response.status}): ${rawText.slice(0, 150) || response.statusText}`
        );
      }

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes("API key")) {
          setShowSettings(true);
        }
        throw new Error(data.error || "Failed to generate diagnosis.");
      }

      setResult(data.result);
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] p-6 relative">
      <header className="flex justify-between items-center max-w-5xl mx-auto mb-8">
        <h1 className="text-xl font-bold text-gray-900">FixIt AI</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 transition"
        >
          ⚙️
        </button>
      </header>

      {showSettings && (
        <div className="max-w-5xl mx-auto mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gemini API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={() => saveApiKey(apiKey)}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto space-y-6">
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-white">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                processAndSetImage(file);
              }
            }}
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
                  disabled={loading || isProcessingImage}
                  className="w-full text-left pt-3 pb-1 px-3 text-white font-medium text-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isProcessingImage
                    ? "Processing image..."
                    : loading
                    ? "Diagnosing..."
                    : "Diagnose this issue"}
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
