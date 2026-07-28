'use client';

interface DifficultyMeterProps {
  level: 'Easy' | 'Moderate' | 'Hard' | 'Expert';
  score: number;
}

const LEVEL_COLORS = {
  Easy: { bg: 'bg-green-100', fill: 'bg-green-500', text: 'text-green-700' },
  Moderate: { bg: 'bg-yellow-100', fill: 'bg-yellow-500', text: 'text-yellow-700' },
  Hard: { bg: 'bg-orange-100', fill: 'bg-orange-500', text: 'text-orange-700' },
  Expert: { bg: 'bg-red-100', fill: 'bg-red-500', text: 'text-red-700' },
};

export default function DifficultyMeter({ level, score }: DifficultyMeterProps) {
  const colors = LEVEL_COLORS[level];
  const percentage = (score / 10) * 100;

  return (
    <div className={`rounded-lg p-3 ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-body-sm font-medium ${colors.text}`}>
          {level}
        </span>
        <span className={`text-caption ${colors.text}`}>{score}/10</span>
      </div>
      <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.fill}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
