import {z} from 'zod';

/** Deterministic, locally synthesised cues. No imported recordings or remote paths. */
export const sfxNames = ['bloop', 'whoosh', 'tick', 'chime'] as const;
export const sfxSchema = z.object({
  frame: z.number().int().min(0).max(20000),
  sound: z.enum(sfxNames),
  gain: z.number().min(0).max(0.6).default(0.3),
}).strict();
export type Sfx = z.infer<typeof sfxSchema>;
export const sfxRate = 48000;
export const sfxDuration = {bloop: 0.22, whoosh: 0.42, tick: 0.08, chime: 0.65} as const;

// Analytic oscillators + seeded noise, with attack/release envelopes to prevent clicks.
export function synthCue(sound: Sfx['sound'], rate = sfxRate): Float32Array {
  const duration = sfxDuration[sound], out = new Float32Array(Math.ceil(duration * rate));
  let seed = 0x51f15e, low = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / rate, u = t / duration;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 0x80000000 - 1;
    low += (noise - low) * 0.16;
    const envelope = Math.sin(Math.PI * u) ** 2;
    let sample = 0;
    if (sound === 'bloop') sample = Math.sin(2 * Math.PI * (740 * t - 1100 * t * t)) * Math.exp(-8 * t);
    if (sound === 'whoosh') sample = low * 2.2 + Math.sin(2 * Math.PI * (180 * t + 700 * t * t)) * 0.08;
    if (sound === 'tick') sample = Math.sin(2 * Math.PI * 1600 * t) * Math.exp(-65 * t) + noise * Math.exp(-90 * t) * 0.25;
    if (sound === 'chime') sample = (Math.sin(2 * Math.PI * 660 * t) + Math.sin(2 * Math.PI * 990 * t) * 0.5) * Math.exp(-6 * t) * 0.6;
    out[i] = Math.max(-1, Math.min(1, sample * envelope));
  }
  return out;
}

export function pcmWav(samples: Float32Array, rate = sfxRate): Uint8Array {
  const buffer = new ArrayBuffer(44 + samples.length * 2), view = new DataView(buffer);
  const text = (offset: number, value: string) => Array.from(value).forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => view.setInt16(44 + i * 2, Math.round(Math.max(-0.95, Math.min(0.95, s)) * 32767), true));
  return new Uint8Array(buffer);
}

/** Sample-accurate 30fps scheduling; events past the end are trimmed, overlapping cues are summed. */
export function mixSfx(events: Sfx[], totalFrames: number, fps = 30, rate = sfxRate): Float32Array {
  const mixed = new Float32Array(Math.ceil(totalFrames / fps * rate));
  for (const event of events) {
    const start = Math.round(event.frame / fps * rate), cue = synthCue(event.sound, rate);
    for (let i = 0; i < cue.length && start + i < mixed.length; i++) mixed[start + i] += cue[i] * event.gain;
  }
  return mixed;
}

const urls = new Map<string, string>();
export function sfxDataUrl(sound: Sfx['sound']): string {
  if (!urls.has(sound)) {
    const bytes = pcmWav(synthCue(sound));
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    urls.set(sound, `data:audio/wav;base64,${btoa(binary)}`);
  }
  return urls.get(sound)!;
}
