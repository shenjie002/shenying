import type {TimedScene} from './schema';

/** Punctuation belongs to its clause; never split a word to meet a character quota. */
export function subtitlePages(text: string, preferredLength = 28): string[] {
  // Keep closing quotation marks with the sentence they close.
  const sentences = text.match(/[^。！？!?\n]+[。！？!?]+[”’」』）)]*|[^。！？!?\n]+(?:\n|$)/gu) ?? [];
  return sentences.flatMap(sentence => {
    const clean = sentence.trim();
    if (!clean) return [];
    if (Array.from(clean).length <= preferredLength) return [clean];
    const clauses = clean.match(/[^，,；;：:]+[，,；;：:]*[”’」』）)]*/gu) ?? [clean];
    // Prefer complete clauses over filling a fixed-width page. A long clause wraps on screen.
    return clauses.map(clause => clause.trim()).filter(Boolean);
  });
}

export function subtitleAt(scene: TimedScene, frame: number) {
  if (scene.subtitles === false) return '';
  const segment = scene.narrationSegments?.find(s => frame >= s.from && frame < s.from + s.durationInFrames);
  const text = segment?.text ?? (scene.narrationSegments ? '' : scene.voiceover);
  if (!text) return '';
  const from = segment?.from ?? 0;
  const duration = segment?.durationInFrames ?? scene.durationInFrames;
  if (frame < from || frame >= from + duration) return '';
  const pages = subtitlePages(text);
  const weights = pages.map(page => Array.from(page).length);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  // Clause timing is proportional to text length, not measured word alignment.
  const position = (frame - from) / Math.max(1, duration) * total;
  let end = 0;
  return pages.find((_, index) => {end += weights[index]; return position < end;}) ?? '';
}
