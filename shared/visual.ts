import {motionTiming} from './capabilities';
import type {TimedScene} from './schema';

export const visualDefaults = {background: 'glow', animation: 'spring', pace: 'progressive'} as const;
export function visualOf(scene: TimedScene) {return scene.visual ?? visualDefaults;}
// Reserve the end of each scene for reading. Timings are frame-based, not speech alignment.
export function eventFrame(scene: TimedScene, index: number, count: number): number {
  if (visualOf(scene).pace === 'all') return 0;
  const segment = scene.narrationSegments?.find(s => s.target === index + 1);
  if (segment) return segment.from;
  const beat = scene.beats?.find(b => b.target === index + 1);
  if (beat) return Math.floor(beat.at * scene.durationInFrames);
  return Math.floor(index / Math.max(1, count) * scene.durationInFrames * motionTiming.autoRevealRatio);
}
export function activeTarget(scene: TimedScene, frame: number, count: number) {
  if (scene.narrationSegments?.some(s => s.target)) {
    const segment = [...scene.narrationSegments].reverse().find(s => s.target && frame >= s.from);
    return segment?.target ? segment.target - 1 : -1;
  }
  if (scene.beats?.length) {
    const beat = [...scene.beats].reverse().find(b => frame >= Math.floor(b.at * scene.durationInFrames));
    return beat ? beat.target - 1 : -1;
  }
  return Math.min(count - 1, Math.floor(Math.max(0, frame) / Math.max(1, scene.durationInFrames * motionTiming.autoRevealRatio) * count));
}
export function captionAt(scene: TimedScene, frame: number) {
  const segment = scene.narrationSegments?.find(s => frame >= s.from && frame < s.from + s.durationInFrames);
  if (segment?.caption) return segment.caption;
  return [...(scene.beats ?? [])].reverse().find(b => frame >= Math.floor(b.at * scene.durationInFrames))?.caption;
}
