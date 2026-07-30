'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Camera, Image as ImageIcon, Film, Send } from 'lucide-react';
import { ProcessingIndicator } from '@/components/ui';
import ChatMessage from './ChatMessage';
import CameraCapture from './CameraCapture';
import type { ChatMessage as ChatMessageType, DiagnosticOutput } from '@/lib/types';

const MAX_VIDEO_SIZE = 40 * 1024 * 1024;

interface WorkspaceScreenProps {
  userId: string;
}

export default function WorkspaceScreen({ userId }: WorkspaceScreenProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStoredApiKey = (): string | null => {
    if (typeof window === 'undefined') return null;

    const localKey =
      localStorage.getItem('gemini_api_key') ||
      localStorage.getItem('fixit_api_key');

    if (localKey) return localKey;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'gemini_api_key' || name === 'fixit_api_key') {
        return decodeURIComponent(value);
      }
    }

    return null;
  };

  const handleSubmitDiagnosis = async (file: File, type: 'image' | 'video') => {
    const apiKey = getStoredApiKey();

    if (!apiKey) {
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'No API key found. Please set up your key in Settings.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      scrollToBottom();
      return;
    }

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: type === 'video' ? 'Diagnose from this video' : 'Diagnose this issue',
      media: {
        type,
        url: URL.createObjectURL(file),
        name: file.name,
      },
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setProcessing(true);
    scrollToBottom();

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('message', 'Diagnose this home repair issue.');
      formData.append('apiKey', apiKey);
      formData.append('image', file);

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || 'Something went wrong. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const aiMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '',
          diagnosticOutput: data.diagnosis as DiagnosticOutput,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch {
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Network error. Check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setProcessing(false);
    scrollToBottom();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSubmitDiagnosis(file, 'image');
    e.target.value = '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      alert(
        `Videos work best under 30 seconds — try a shorter clip.\n\nSelected: ${(file.size / 1024 / 1024).toFixed(1)}MB\nMaximum: 40MB`
      );
      e.target.value = '';
      return;
    }

    handleSubmitDiagnosis(file, 'video');
    e.target.value = '';
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    handleSubmitDiagnosis(file, 'image');
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="flex items-center justify-between px-5 py-3 border-b border-ink-100 bg-surface-raised">
        <h1 className="text-title text-ink-900">FixIt AI</h1>
        <button
          type="button"
          onClick={() => router.push('/settings')}
          className="p-2 text-ink-500 hover:text-ink-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-title text-ink-700 mb-2">
              Take a photo of something that needs fixing
            </h2>
            <p className="text-body-sm text-ink-400 max-w-xs">
              Snap a photo, upload from your gallery, or shoot a short video.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {processing && (
          <ProcessingIndicator message="Analyzing your repair..." />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-ink-100 bg-surface-raised px-4 py-3">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="p-2.5 rounded-xl text-ink-500 hover:bg-ink-100 disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Upload photo"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setShowCamera(true)}
            disabled={processing}
            className="p-2.5 rounded-xl text-ink-500 hover:bg-ink-100 disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Take photo"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={processing}
            className="p-2.5 rounded-xl text-ink-500 hover:bg-ink-100 disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Upload video"
          >
            <Film className="w-5 h-5" />
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />

          <div className="flex-1" />

          <button
            type="button"
            disabled
            className="p-2.5 rounded-xl bg-brand-500 text-white opacity-30 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
