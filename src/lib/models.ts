// D16: Two hardcoded model strings behind getModel() config constants.
// Autonomous 3-layer registry deferred to Phase 8.

const MODELS = {
  multimodal: 'gemini-2.0-flash',
  text_chat: 'gemini-2.0-flash',
} as const;

export function getModel(task: 'multimodal' | 'text_chat' = 'multimodal'): string {
  return MODELS[task];
}
