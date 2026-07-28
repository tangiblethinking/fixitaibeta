'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Wrench, Package, Gauge } from 'lucide-react';
import type { DiagnosticOutput } from '@/lib/types';
import { Card } from '@/components/ui';
import DifficultyMeter from './DifficultyMeter';

interface DiagnosticCardProps {
  diagnosis: DiagnosticOutput;
}

export default function DiagnosticCard({ diagnosis }: DiagnosticCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (section: string) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  return (
    <Card className="space-y-4">
      {/* Summary */}
      <div>
        <h3 className="text-title text-ink-900 mb-2">
          {diagnosis.diagnosis.summary.split('.')[0]}.
        </h3>
        <p className="text-body-sm text-ink-600">
          {diagnosis.diagnosis.rootCause}
        </p>
      </div>

      {/* Difficulty */}
      <DifficultyMeter
        level={diagnosis.difficulty.level}
        score={diagnosis.difficulty.score}
      />

      {/* Estimated Cost */}
      <div className="flex items-center justify-between py-2 border-t border-ink-100">
        <span className="text-body-sm text-ink-500">Estimated DIY cost</span>
        <span className="text-body font-medium text-ink-900">
          {diagnosis.estimatedTotalCost}
        </span>
      </div>

      {/* Parts - Expandable */}
      <button
        onClick={() => toggle('parts')}
        className="flex items-center justify-between w-full py-2 border-t border-ink-100 min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-500" />
          <span className="text-body-sm font-medium text-ink-700">
            Parts needed ({diagnosis.parts.length})
          </span>
        </div>
        {expandedSection === 'parts' ? (
          <ChevronUp className="w-4 h-4 text-ink-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-400" />
        )}
      </button>
      {expandedSection === 'parts' && (
        <div className="space-y-2 pl-6">
          {diagnosis.parts.map((part, i) => (
            <div key={i} className="flex justify-between text-body-sm">
              <div>
                <p className="text-ink-700">{part.name}</p>
                <p className="text-ink-400">{part.specs}</p>
              </div>
              <span className="text-ink-600 whitespace-nowrap ml-3">
                {part.estimatedCost}
              </span>
            </div>
          ))}
          <p className="text-caption text-ink-400 italic mt-2">
            Prices are AI estimates — check your local store for exact pricing.
          </p>
        </div>
      )}

      {/* Difficulty Details - Expandable */}
      <button
        onClick={() => toggle('difficulty')}
        className="flex items-center justify-between w-full py-2 border-t border-ink-100 min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-brand-500" />
          <span className="text-body-sm font-medium text-ink-700">
            Why it&apos;s {diagnosis.difficulty.level.toLowerCase()}
          </span>
        </div>
        {expandedSection === 'difficulty' ? (
          <ChevronUp className="w-4 h-4 text-ink-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-400" />
        )}
      </button>
      {expandedSection === 'difficulty' && (
        <p className="text-body-sm text-ink-600 pl-6">
          {diagnosis.difficulty.explanation}
        </p>
      )}

      {/* Assumptions */}
      {diagnosis.assumptions.length > 0 && (
        <button
          onClick={() => toggle('assumptions')}
          className="flex items-center justify-between w-full py-2 border-t border-ink-100 min-h-[44px]"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-ink-400" />
            <span className="text-body-sm font-medium text-ink-500">
              Assumptions made
            </span>
          </div>
          {expandedSection === 'assumptions' ? (
            <ChevronUp className="w-4 h-4 text-ink-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-400" />
          )}
        </button>
      )}
      {expandedSection === 'assumptions' && (
        <ul className="space-y-1 pl-6">
          {diagnosis.assumptions.map((a, i) => (
            <li key={i} className="text-body-sm text-ink-500">
              • {a}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
