"use client";

import React, { useState } from "react";

interface WorkspaceScreenProps {
  userId?: string;
}

export default function WorkspaceScreen({ userId }: WorkspaceScreenProps) {
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
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: image,
          imageData: image,
          prompt: "Diagnose this repair issue",
        }),
      });

      const rawText = await response.text();
      let data: any = {};

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned invalid response format.`);
      }

      if (!response.ok) {
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
            <div className="relative mt-4 max-w-md ml-auto">
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
