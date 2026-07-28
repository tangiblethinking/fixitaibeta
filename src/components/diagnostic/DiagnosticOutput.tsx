'use client';

import type { DiagnosticOutput as DiagnosticOutputType } from '@/lib/types';
import DiagnosticCard from './DiagnosticCard';

interface DiagnosticOutputProps {
  data: DiagnosticOutputType;
}

// Wrapper for future progressive disclosure enhancements
export default function DiagnosticOutput({ data }: DiagnosticOutputProps) {
  return <DiagnosticCard diagnosis={data} />;
}
