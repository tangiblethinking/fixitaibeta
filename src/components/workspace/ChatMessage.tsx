'use client';

import type { ChatMessage as ChatMessageType } from '@/lib/types';
import DiagnosticCard from '@/components/diagnostic/DiagnosticCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-brand-500 text-white rounded-2xl rounded-br-md px-4 py-3'
            : 'w-full'
        }`}
      >
        {/* User media */}
        {isUser && message.media && (
          <div className="mb-2">
            {message.media.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.media.url}
                alt="Uploaded"
                className="rounded-xl max-h-48 w-auto"
              />
            ) : (
              <div className="flex items-center gap-2 text-white/80 text-body-sm">
                <span>🎬</span>
                <span>{message.media.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <p className={isUser ? 'text-body' : 'text-body text-ink-700'}>
            {message.content}
          </p>
        )}

        {/* Diagnostic output */}
        {!isUser && message.diagnosticOutput && (
          <DiagnosticCard diagnosis={message.diagnosticOutput} />
        )}
      </div>
    </div>
  );
}
