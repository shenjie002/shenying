import express from 'express';
import path from 'node:path';
import {z} from 'zod';
import {scriptSchema} from '../shared/schema';
import {root, readScript, readTimeline, saveJson, prepare, render} from './pipeline';
import {loadEnv} from './env';
import {generateArticle, modelStatus} from './article';

loadEnv();

const app = express();
app.disable('x-powered-by');
// Local-only service: reject cross-origin browser writes (including DNS rebinding).
const hosts = new Set(['127.0.0.1:3001', 'localhost:3001', '127.0.0.1:5173', 'localhost:5173']);
app.use((req, res, next) => {
  if (!hosts.has(req.headers.host || '')) {res.status(403).json({error: '仅允许本地访问'}); return;}
  const origin = req.headers.origin;
  if (origin && !['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3001', 'http://localhost:3001'].includes(origin)) {res.status(403).json({error: '不允许的来源'}); return;}
  next();
});
app.use(express.json({limit: '1mb'}));
let job: {id: string; kind: string; status: 'running' | 'done' | 'error'; progress: number; logs: string[]; output?: string; error?: string} | null = null;
let generating = false;
const asyncRoute = (fn: express.RequestHandler): express.RequestHandler => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
app.get('/api/project', asyncRoute(async (_req, res) => {
  const script = await readScript(); res.json({script, timeline: await readTimeline(script), job});
}));
app.put('/api/script', asyncRoute(async (req, res) => {
  if (job?.status === 'running' || generating) {res.status(409).json({error: '任务执行中，暂不能保存'}); return;}
  const script = scriptSchema.parse(req.body); await saveJson(path.join(root, 'script.json'), script); res.json({script});
}));
app.get('/api/model', (_req, res) => {res.json(modelStatus());});
app.post('/api/article/generate', asyncRoute(async (req, res) => {
  if (job?.status === 'running' || generating) {res.status(409).json({error: '已有任务执行中，请等待完成'}); return;}
  generating = true;
  const controller = new AbortController();
  const onClose = () => {if (!res.writableEnded) controller.abort();};
  res.on('close', onClose);
  try {
    const script = await generateArticle(req.body, controller.signal);
    if (!controller.signal.aborted) res.json({script, model: modelStatus().model});
  } finally {generating = false; res.off('close', onClose);}
}));
app.get('/api/job', (_req, res) => {res.json({job});});
app.post('/api/jobs', asyncRoute(async (req, res) => {
  if (job?.status === 'running' || generating) {res.status(409).json({error: '已有任务执行中'}); return;}
  const {kind} = z.object({kind: z.enum(['tts', 'silent', 'render', 'draft'])}).parse(req.body);
  // Lock before the first await to prevent concurrent requests from starting jobs.
  const current = {id: String(Date.now()), kind, status: 'running' as const, progress: 0, logs: [] as string[]};
  job = current;
  const log = (s: string) => {current.logs.push(s.slice(0, 4000)); if (current.logs.length > 100) current.logs.shift();};
  res.status(202).json({job});
  void (async () => {
    try {
      const script = await readScript();
      if (kind === 'render' || kind === 'draft') job!.output = await render(script, log, n => {job!.progress = n;}, false, kind === 'draft');
      else await prepare(script, kind, log);
      job!.status = 'done'; job!.progress = 1;
    } catch (error) {job!.status = 'error'; job!.error = error instanceof Error ? error.message : String(error); log(job!.error!);}
  })();
}));
app.use('/out', express.static(path.join(root, 'out'), {index: false}));
app.use('/audio', express.static(path.join(root, 'public/audio'), {index: false}));
app.use(express.static(path.join(root, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist/index.html')));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (res.destroyed || res.headersSent) return;
  res.status(error instanceof z.ZodError ? 400 : 500).json({error: error instanceof Error ? error.message : '内部错误'});
});
app.listen(3001, '127.0.0.1', () => console.log('Video API: http://127.0.0.1:3001'));
