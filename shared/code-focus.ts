import {z} from 'zod';

/** One-based source lines, including blanks; sentence starts use the shared narration clock. */
export const codeFocusSchema = z.array(z.object({
  sentence: z.number().int().min(1).max(50),
  line: z.number().int().min(1).max(100),
}).strict()).min(1).max(50);
export type CodeFocus = z.infer<typeof codeFocusSchema>;
export function codeLineAt(steps: CodeFocus | undefined, starts: number[], frame: number) {
  let line: number | undefined;
  for (const step of steps ?? []) {
    if (frame >= (starts[step.sentence - 1] ?? Infinity)) line = step.line;
  }
  return line;
}
export function codeWindow(line: number | undefined, count: number, visible = 8) {
  return Math.max(0, Math.min(Math.max(0, count - visible), (line ?? 1) - Math.ceil(visible / 2)));
}
