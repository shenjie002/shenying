import {CanvasEditor} from './CanvasEditor';
import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {NarrationEditor} from './NarrationEditor';
import {MotionEditor} from './MotionEditor';
import {ArticleComposer} from './ArticleComposer';
import {ArticleVideo} from '../src/ArticleVideo';
import {previewTimeline, scriptSchema, type Script, type Scene, type Timeline} from '../shared/schema';
import visualExample from '../input/visual-upgrade.json';
import './style.css';
import './motion.css';

type Job = {id: string; kind: string; status: string; progress: number; logs: string[]; output?: string; error?: string};
async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, {...init, headers: {'Content-Type': 'application/json'}});
  const data = await res.json(); if (!res.ok) throw new Error(data.error || '请求失败'); return data;
}
const names = {CanvasSlide: '混合画布',TitleSlide: '标题封面', BulletListSlide: '要点列表', CodeSlide: '代码讲解', CardSlide: '双栏对比', FlowSlide: '流程演示', TerminalSlide: '终端演示'};
const icons = {CanvasSlide: '▦',TitleSlide: 'T', BulletListSlide: '☷', CodeSlide: '⌘', CardSlide: '◫', FlowSlide: '⇢', TerminalSlide: '>_'};
function newScene(template: Scene['template']): Scene {
  const base = {id: `scene_${crypto.randomUUID()}`, voiceover: '在这里写下这一幕的讲解内容。'};
  switch (template) {
    case 'CanvasSlide': return {...base, template, props: {heading: '代码与提示同屏', layout: 'split-2-1', blocks: [{id: 'code', type: 'CodeBlock', props: {language: 'javascript', code: 'const idea = "Make it clear";'}}, {id: 'tip', type: 'CalloutBlock', props: {variant: 'info', text: '一个画面组合多种信息。'}}]}};
    case 'TitleSlide': return {...base, template, props: {title: '一个值得讲清楚的概念', subtitle: '从这里开始探索'}};
    case 'BulletListSlide': return {...base, template, props: {heading: '关键要点', bullets: ['第一个要点', '第二个要点']}};
    case 'CodeSlide': return {...base, template, props: {heading: '看懂这段代码', language: 'javascript', code: 'const idea = "Make it clear";\nconsole.log(idea);'}};
    case 'FlowSlide': return {...base, template, props: {heading: '请求是怎样完成的？', steps: ['发起请求', '服务处理', '返回结果'], description: '跟随数据，理解每一步的作用。'}};
    case 'TerminalSlide': return {...base, template, props: {heading: '从命令到结果', commands: ['npm install', 'npm run build'], outputs: ['Dependencies installed.', 'Build completed successfully.']}};
    case 'CardSlide': return {...base, template, props: {heading: '两种思路的对比', leftTitle: '方案 A', leftBody: '第一种思路的特点。', rightTitle: '方案 B', rightBody: '第二种思路的特点。'}};
  }
}
function App() {
  const playerRef = useRef<PlayerRef>(null);
  const [script, setScript] = useState<Script | null>(null), [timeline, setTimeline] = useState<Timeline | null>(null);
  const [selected, setSelected] = useState(0), [dirty, setDirty] = useState(false), [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [tab, setTab] = useState<'edit' | 'json'>('edit');
  const [json, setJson] = useState(''), [toast, setToast] = useState('');
  const [articleBusy, setArticleBusy] = useState(false);
  const running = job?.status === 'running', locked = busy || running || articleBusy;
  const load = async () => {const d = await api('/api/project'); setScript(d.script); setTimeline(d.timeline); setJob(d.job); setJson(JSON.stringify(d.script, null, 2)); setDirty(false);};
  useEffect(() => {load().catch(e => setError(e.message));}, []);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {api('/api/job').then(async d => {setJob(d.job); if (d.job?.status !== 'running') {const p = await api('/api/project'); setTimeline(p.timeline); if (d.job?.error) setError(d.job.error);}}).catch(e => setError(e.message));}, 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {if (!toast) return; const t = setTimeout(() => setToast(''), 3500); return () => clearTimeout(t);}, [toast]);
  useEffect(() => {const handler = (e: BeforeUnloadEvent) => {if (dirty) e.preventDefault();}; window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler);}, [dirty]);
  const update = (next: Script) => {setScript(next); setJson(JSON.stringify(next, null, 2)); setDirty(true); setTimeline(null);};
  const save = async () => {
    if (!script) return;
    const parsed = scriptSchema.parse(script);
    await api('/api/script', {method: 'PUT', body: JSON.stringify(parsed)}); setDirty(false); setToast('剧本已保存到本地');
  };
  const action = async (kind: 'tts' | 'silent' | 'render') => {
    setError(''); setBusy(true);
    try {if (dirty) await save(); const d = await api('/api/jobs', {method: 'POST', body: JSON.stringify({kind})}); setJob(d.job);} catch (e) {setError((e as Error).message);} finally {setBusy(false);}
  };
  if (!script) return <div className="loading"><span className="brand-icon">◈</span><h2>正在连接本地工作室</h2><p>{error || '读取项目中…'}</p>{error && <button onClick={() => load().catch(e => setError(e.message))}>重新连接</button>}</div>;
  const scene = script.scenes[selected] || script.scenes[0];
  const view = timeline || previewTimeline(script);
  const seekScene = (index: number) => {setSelected(index); playerRef.current?.pause(); playerRef.current?.seekTo(view.scenes.slice(0, index).reduce((sum, item) => sum + item.durationInFrames, 0));};
  const estimatedSeconds = view.totalFrames / 30;
  const patchScene = (next: Scene) => update({...script, scenes: script.scenes.map((s, i) => i === selected ? next : s)});
  const patchProp = (key: string, value: unknown) => patchScene({...scene, props: {...scene.props, [key]: value}} as Scene);
  const move = (direction: number) => {const target = selected + direction; if (target < 0 || target >= script.scenes.length) return; const scenes = [...script.scenes]; [scenes[selected], scenes[target]] = [scenes[target], scenes[selected]]; update({...script, scenes}); setSelected(target);};
  const changeJson = () => {try {const value = scriptSchema.parse(JSON.parse(json)); update(value); setSelected(0); setTab('edit'); setError(''); setToast('JSON 已应用，请保存剧本');} catch (e) {setError((e as Error).message);}};
  return <div className="app">
    <aside className="sidebar"><a className="brand" href="/"><span className="brand-icon">◈</span><div>申映<span>LOCAL VIDEO STUDIO</span></div></a><div className="workspace-label">工作空间</div><div className="nav active"><span>◫</span> 视频工作室 <span className="nav-dot"/></div><div className="side-project"><div className="small-label">当前项目</div><strong>{script.title}</strong><p>{script.scenes.length} 个分镜 · 1920 × 1080</p></div><div className="side-bottom"><span className="online-dot"/> 本地服务已连接<p>内容与成片保存在本机<br/>语音及文章生成使用在线服务</p><div className="version">申映工作室 <span>v0.1</span></div></div></aside>
    <main><header><div className="breadcrumb">工作空间 <span>/</span> 视频工作室</div><div className="local-badge">◉ LOCAL FIRST</div></header>
      <section className="page-title"><div><div className="eyebrow">CREATE SOMETHING WORTH EXPLAINING</div><h1>让知识，跃然屏上<span>。</span></h1><p>从一段文字开始，编排你的下一支讲解视频。</p></div><button className="secondary" disabled={locked || !dirty} onClick={async () => {setBusy(true); try {await save();} catch(e) {setError((e as Error).message);} finally {setBusy(false);}}}>{dirty ? '● 保存剧本' : '✓ 已保存'}</button></section>
      {error && <div role="alert" className="error"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}
      <ArticleComposer disabled={busy || running} onBusyChange={setArticleBusy} onApply={draft => {update(draft); setSelected(0); setTab('edit'); setError(''); playerRef.current?.pause(); playerRef.current?.seekTo(0); setToast('新剧本已应用到编辑器，请检查并保存');}}/>
      <section className="workflow"><div className="step done"><b>01</b><div>编排剧本<small>组织内容与分镜</small></div></div><span className="step-line"/><div className={`step ${timeline ? 'done' : ''}`}><b>02</b><div>生成配音<small>{timeline ? (timeline.mode === 'tts' ? '旁白已就绪' : '静音预览已就绪') : '声音驱动时间轴'}</small></div></div><span className="step-line"/><div className={`step ${job?.output ? 'done' : ''}`}><b>03</b><div>渲染导出<small>交付你的作品</small></div></div><span className="format-tag">HD <span>1080p / 30fps</span></span></section>
      <div className="studio-grid"><section className="panel editor"><div className="panel-heading"><h2>分镜编排 <span>{String(script.scenes.length).padStart(2, '0')}</span></h2><div className="tabs"><button className={tab === 'edit' ? 'selected' : ''} onClick={() => setTab('edit')}>可视化</button><button className={tab === 'json' ? 'selected' : ''} onClick={() => setTab('json')}>JSON</button></div></div>
        {tab === 'json' ? <div className="json-editor"><p>粘贴由 Agent 生成的标准剧本，校验后应用。</p><button className="secondary" disabled={locked} onClick={() => {if (window.confirm('用视觉升级示例替换编辑区内容？仅点击“校验并应用”并保存后才会覆盖当前项目。')) setJson(JSON.stringify(visualExample, null, 2));}}>载入视觉升级示例</button><textarea aria-label="剧本 JSON" spellCheck={false} value={json} disabled={locked} onChange={e => setJson(e.target.value)}/><button disabled={locked} className="primary" onClick={changeJson}>校验并应用 JSON</button></div> : <><div className="scene-strip">{script.scenes.map((s, i) => <button className={`scene-chip ${selected === i ? 'selected' : ''}`} key={s.id} onClick={() => seekScene(i)}><span>{icons[s.template]}</span><small>{String(i + 1).padStart(2, '0')} {names[s.template]}</small></button>)}</div><div className="form-content"><div className="scene-toolbar"><span>SCENE {String(selected + 1).padStart(2, '0')}</span><div><button aria-label="上移分镜" disabled={locked || selected === 0} onClick={() => move(-1)}>↑</button><button aria-label="下移分镜" disabled={locked || selected === script.scenes.length - 1} onClick={() => move(1)}>↓</button><button aria-label="删除分镜" disabled={locked || script.scenes.length <= 1} onClick={() => {update({...script, scenes: script.scenes.filter((_, i) => i !== selected)}); setSelected(Math.max(0, selected - 1));}}>删除</button></div></div>
          <fieldset disabled={locked}><label>项目名称<input value={script.title} onChange={e => update({...script, title: e.target.value})}/></label><div className="field-row"><label>画面模板<select value={scene.template} onChange={e => {const next = newScene(e.target.value as Scene['template']); patchScene({...next, id: scene.id, voiceover: scene.voiceover, visual: scene.visual});}}>{Object.entries(names).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label><label>幕间留白<select value={script.tailPaddingFrames} onChange={e => update({...script, tailPaddingFrames: Number(e.target.value)})}><option value={0}>无留白</option><option value={6}>0.2 秒</option><option value={12}>0.4 秒</option><option value={24}>0.8 秒</option></select></label></div>
          {scene.template === 'CanvasSlide' ? <CanvasEditor key={`${scene.id}-${JSON.stringify(scene.props)}`} scene={scene} onChange={patchScene}/> : Object.entries(scene.props).map(([key, value]) => <label key={key}>{({title:'主标题',subtitle:'副标题',heading:'画面标题',bullets:'要点（每行一条，最多 6 条）',language:'代码语言',code:'代码内容',leftTitle:'左卡标题',leftBody:'左卡正文',rightTitle:'右卡标题',rightBody:'右卡正文',steps:'流程节点（每行一个，2～5 个）',description:'流程说明',commands:'演示命令（每行一条，最多 5 条）',outputs:'对应输出（每行对应一条命令）'} as Record<string,string>)[key]}{['title','code','bullets','leftBody','rightBody','steps','commands','outputs','description'].includes(key) ? <textarea className={key === 'code' ? 'code-input' : ''} rows={key === 'code' ? 7 : key === 'bullets' ? 4 : 2} value={Array.isArray(value) ? value.join('\n') : value} onChange={e => patchProp(key, ['bullets', 'steps', 'commands', 'outputs'].includes(key) ? e.target.value.split('\n') : e.target.value)}/> : <input value={String(value)} onChange={e => patchProp(key, e.target.value)}/>}</label>)}
          <NarrationEditor scene={scene} onChange={patchScene}/>
          <MotionEditor scene={scene} onChange={patchScene}/>
          <label className="voice-label"><span>旁白文案 <small>◉ 晓晓 · 普通话</small></span><textarea rows={4} readOnly={!!scene.narration?.length} value={scene.voiceover} onChange={e => patchScene({...scene, voiceover: e.target.value})}/><span className="field-hint">自然、简洁的口语表达更适合讲解。<span>{scene.voiceover.length} 字</span></span></label></fieldset></div><button className="add-scene" disabled={locked || script.scenes.length >= 30} onClick={() => {update({...script, scenes: [...script.scenes, newScene('TitleSlide')]}); setSelected(script.scenes.length);}}>＋ 添加一个分镜</button></>}
      </section><div className="right-column"><section className="panel preview-panel"><div className="panel-heading"><h2>画面预览</h2><span className="preview-badge">{timeline?.mode === 'tts' ? '真实配音' : '静音预览'}</span></div><div className="player-wrap"><Player ref={playerRef} key={`${timeline?.sourceHash || 'draft'}-${script.scenes.length}`} component={ArticleVideo} inputProps={{scriptData: view}} durationInFrames={view.totalFrames} compositionWidth={1920} compositionHeight={1080} fps={30} controls style={{width: '100%'}}/></div><div className="preview-meta"><span>16:9 <i/> 1920 × 1080</span><span>{timeline?.mode === 'tts' ? '实测时长' : '估算时长'} · {Math.floor(estimatedSeconds / 60)}:{String(Math.floor(estimatedSeconds) % 60).padStart(2, '0')}</span></div><p className="preview-tip">↳ 分句模式按实测句首聚焦；静音和字幕长句分页为估算。</p></section>
        <section className="panel production"><div className="panel-heading"><h2>制作与导出</h2><span className="small-label">REMOTION ENGINE</span></div><div className="production-body"><div className="export-info"><div className="export-icon">↗</div><div><strong>高清 MP4 视频</strong><p>H.264 编码 · 1080p · 30 帧/秒</p></div></div><div className="button-row"><button className="secondary" disabled={locked} onClick={() => action('silent')}>静音试跑</button><button className="secondary" disabled={locked} onClick={() => action('tts')}>◉ 生成配音</button></div><button className="primary render-button" disabled={locked || !timeline || dirty} onClick={() => action('render')}>{running ? '制作任务进行中…' : '开始渲染视频'} <span>↗</span></button><p className="export-note">{dirty ? '剧本已修改，请重新生成时间轴。' : !timeline ? '先生成配音，或使用静音试跑验证流程。' : timeline.mode === 'silent' ? '当前为静音模式，导出的视频不包含旁白。' : '配音已就绪，可以开始渲染。'}</p>
          {job && <div className="job"><div className="job-title"><span>{job.status === 'running' ? '◌ 正在处理' : job.status === 'error' ? '任务失败' : '✓ 任务完成'}</span><span>{Math.round(job.progress * 100)}%</span></div><div className="progress"><div style={{width: `${job.progress * 100}%`}}/></div><pre aria-live="polite">{job.logs.join('\n') || '正在初始化…'}</pre>{job.output && <a className="download" href={job.output} download>↓ 下载已生成的视频</a>}</div>}
        </div></section><div className="local-note"><span>⌁</span><p><strong>你的创作，你掌控。</strong><br/>剧本和视频留在本地；AI 编排发送文章，配音发送旁白文本。</p></div></div></div>
      <footer>申映 · 让每一个好想法，都值得被看见。<span>POWERED BY REMOTION + VITE</span></footer>
    </main>{toast && <div role="status" className="toast">✓ {toast}</div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
