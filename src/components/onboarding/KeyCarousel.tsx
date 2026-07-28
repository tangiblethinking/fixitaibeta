'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

interface KeyCarouselProps {
  onEnterKey: () => void;
}

const STEPS = [
  {
    title: 'Go to Google AI Studio',
    description:
      'Open Google AI Studio in a new tab. Sign in with your Google account if prompted.',
    image: '/onboarding/step-1-api-keys.png',
    action: {
      label: 'Open AI Studio',
      url: 'https://aistudio.google.com/apikey',
    },
  },
  {
    title: 'Create a new API key',
    description: 'Click "Create API key" to generate your free key.',
    image: '/onboarding/step-2-create-key.png',
    billingWarning: true,
  },
  {
    title: 'Select a project',
    description:
      'Choose an existing Google Cloud project, or create a new one. The name doesn\'t matter.',
    image: '/onboarding/step-3-create-project.png',
  },
  {
    title: 'Copy your key',
    description:
      'Click the copy icon next to your new API key. Keep this tab open — you\'ll paste it next.',
    image: '/onboarding/step-4-copy-key.png',
  },
];

export default function KeyCarousel({ onEnterKey }: KeyCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="page-container">
      <div className="flex-1 flex flex-col">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all min-w-[8px] min-h-[8px] ${
                i === currentStep
                  ? 'bg-brand-500 w-6'
                  : i < currentStep
                  ? 'bg-brand-300'
                  : 'bg-ink-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-4">
            <p className="text-caption text-brand-500 font-medium mb-1">
              Step {currentStep + 1} of {STEPS.length}
            </p>
            <h2 className="text-title text-ink-900">{step.title}</h2>
            <p className="text-body-sm text-ink-500 mt-2">
              {step.description}
            </p>
          </div>

          {/* Screenshot placeholder */}
          <div className="flex-1 flex items-center justify-center my-4">
            <div className="w-full max-w-xs aspect-[9/16] rounded-card bg-ink-100 border border-ink-200 overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="text-center p-4"><p class="text-body-sm text-ink-400">Screenshot: ${step.title}</p><p class="text-caption text-ink-300 mt-1">Place image at ${step.image}</p></div>`;
                }}
              />
            </div>
          </div>

          {/* Billing warning (only on step 2) */}
          {step.billingWarning && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning-light mb-4">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-body-sm font-medium text-ink-800">
                  Keep billing OFF
                </p>
                <p className="text-body-sm text-ink-600">
                  Google may ask to enable billing — skip it. The free tier
                  gives you plenty of diagnostics per day at no cost.
                </p>
              </div>
            </div>
          )}

          {/* Action link (step 1) */}
          {step.action && (
            <a
              href={step.action.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-brand-50 text-brand-600 font-medium text-body-sm hover:bg-brand-100 transition-colors mb-4 min-h-[44px]"
            >
              {step.action.label}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-4">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 text-body-sm text-ink-500 hover:text-ink-700 disabled:opacity-30 min-h-[44px] px-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {isLast ? (
            <Button onClick={onEnterKey}>
              Enter my key
            </Button>
          ) : (
            <button
              onClick={() =>
                setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))
              }
              className="flex items-center gap-1 text-body-sm text-brand-600 font-medium hover:text-brand-700 min-h-[44px] px-3"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
