import type {TimedScene} from './schema';

export function subtitleAt(scene: TimedScene, frame: number) {
  if (scene.subtitles === false) return '';
  const segment = scene.narrationSegments?.find(s => frame >= s.from && frame < s.from + s.durationInFrames);
  const text = segment?.text ?? (scene.narrationSegments ? '' : scene.voiceover);
  if (!text) return '';
  // Caption pages within a sentence are approximate; only sentence boundaries are measured.
  const pages = text.match(/.{1,28}/gu) ?? [text];
  const from = segment?.from ?? 0;
  const duration = segment?.durationInFrames ?? scene.durationInFrames;
  return pages[Math.min(pages.length - 1, Math.floor((frame - from) / Math.max(1, duration) * pages.length))] ?? '';
}
