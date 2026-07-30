'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Camera, Video, Send } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    '/drywall-repair-example.jpg'
  );

  // Retrieve stored API key automatically when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedKey =
      localStorage.getItem('gemini_api_key') ||
      localStorage.getItem('fixit_api_key');

    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Diagnostic submission handler with direct storage resolution
  const handleDiagnose = async () => {
    if (isLoading) return;

    // Resolve active key directly from state, localStorage, and cookies
    let activeKey = apiKey;

    if (!activeKey && typeof window !== 'undefined') {
      activeKey =
        localStorage.getItem('gemini_api_key') ||
        localStorage.getItem('fixit_api_key') ||
        '';

      if (!activeKey) {
        const match = document.cookie.match(/gemini_api_key=([^;]+)/);
        if (match) {
          activeKey = match[1];
        }
      }
    }

    if (!activeKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'No API key found. Please set up your key in Settings.',
        },
      ]);
      return;
    }

    // Update state with verified key
    setApiKey(activeKey);
    setIsLoading(true);

    const userPrompt = inputMessage.trim() || 'Diagnose this issue';

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: userPrompt,
      },
    ]);

    setInputMessage('');

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          image: selectedImage,
          apiKey: activeKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate diagnosis.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.result || data.message || 'Diagnosis complete.',
        },
      ]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during diagnosis.';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFFDF9] text-slate-800">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">FixIt AI</h1>
        <button
          type="button"
          aria-label="Settings"
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content View */}
      <main className="flex-1 relative overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xl text-sm leading-relaxed ${
              msg.role === 'user' ? 'ml-auto text-right text-slate-900 font-medium' : 'text-slate-700'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {/* Diagnostic Action Card */}
        {selectedImage && (
          <div className="absolute bottom-6 right-6 w-80 rounded-2xl bg-orange-500 overflow-hidden shadow-lg border border-orange-400">
            <div className="relative w-full h-44 bg-slate-200">
              <Image
                src={selectedImage}
                alt="Issue preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleDiagnose}
              disabled={isLoading}
              className="w-full py-3 px-4 text-left text-white font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Diagnosing...' : 'Diagnose this issue'}
            </button>
          </div>
        )}
      </main>

      {/* Bottom Action Dock */}
      <footer className="p-4 bg-white border-t border-slate-100 flex items-center justify-between max-w-4xl mx-auto w-full gap-4">
        <div className="flex items-center gap-4 text-slate-400">
          <button type="button" aria-label="Upload Image" className="hover:text-slate-600 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Take Photo" className="hover:text-slate-600 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Upload Video" className="hover:text-slate-600 transition-colors">
            <Video className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleDiagnose}
          disabled={isLoading}
          aria-label="Send message"
          className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
