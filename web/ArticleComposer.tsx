import {useEffect, useRef, useState} from 'react';
import {articleRequestSchema, templateLabels, type ArticleRequest} from '../shared/article';
import {sceneCapabilities} from '../shared/capabilities';
import {scriptSchema, type Script} from '../shared/schema';
import './article.css';

type Model = {configured: boolean; model: string; host: string};
export function ArticleComposer({disabled, onBusyChange, onApply}: {disabled: boolean; onBusyChange: (busy: boolean) => void; onApply: (script: Script) => void}) {
  const [open, setOpen] = useState(false), [article, setArticle] = useState('');
  const [audience, setAudience] = useState<ArticleRequest['audience']>('general');
  const [style, setStyle] = useState<ArticleRequest['style']>('clear');
  const [duration, setDuration] = useState(90), [sceneCount, setSceneCount] = useState(5);
  const [model, setModel] = useState<Model | null>(null), [draft, setDraft] = useState<Script | null>(null);
  const [error, setError] = useState(''), [generating, setGenerating] = useState(false), [sourceName, setSourceName] = useState('');
  const abort = useRef<AbortController | null>(null);
  const locked = disabled || generating;
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/model', {signal: controller.signal}).then(async r => {if (!r.ok) throw new Error('读取模型配置失败'); setModel(await r.json());}).catch(e => {if (!controller.signal.aborted) setError(e.message);});
    return () => {controller.abort(); abort.current?.abort();};
  }, []);
  const generate = async () => {
    setError('');
    const parsed = articleRequestSchema.safeParse({article, audience, style, duration, sceneCount});
    if (!parsed.success) {setError(parsed.error.issues.map(i => i.message).join('；')); return;}
    setGenerating(true); onBusyChange(true);
    const controller = new AbortController(); abort.current = controller;
    try {
      const response = await fetch('/api/article/generate', {method: 'POST', signal: controller.signal, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(parsed.data)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '剧本生成失败');
      setDraft(scriptSchema.parse(data.script));
    } catch (e) {setError(controller.signal.aborted ? '已取消本地等待；服务商可能仍计费。' : (e as Error).message);}
    finally {setGenerating(false); onBusyChange(false); abort.current = null;}
  };
  return <section className="panel article-panel"><div className="panel-heading"><h2>文章 → 视频剧本 <span>AI DIRECTOR</span></h2><button className="secondary" onClick={() => setOpen(!open)}>{open ? '收起' : '开始创作 ↓'}</button></div>{!open ? <div className="article-intro"><span>✦</span><p>粘贴文章或导入 Markdown，让模型规划旁白、画面与分镜。<br/><small>先审阅，再应用到编辑器；不会直接覆盖已有剧本。</small></p><span className={`model-tag ${model?.configured ? 'ready' : ''}`}>{model ? model.configured ? '模型已配置' : '待配置模型' : '读取配置…'}</span></div> : <div className="article-body">
    <div className="article-status"><span>{model?.configured ? `当前模型：${model.model} · ${model.host}` : '尚未配置模型：请在项目 .env 设置模型地址、名称和密钥，重启服务后刷新页面。'}</span><span>最多 30,000 字符</span></div>
    <label className="article-file">↑ 导入 .md / .txt<input type="file" accept=".md,.markdown,.txt,text/plain,text/markdown" disabled={locked} onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
      if (file.size > 200000) {setError('文件过大，请选择小于 200 KB 的文本文件'); return;}
      if (!/\.(md|markdown|txt)$/i.test(file.name)) {setError('仅支持 Markdown 或 TXT 文件'); return;}
      try {const value = await file.text(); if (value.length > 30000) throw new Error('文章最多 30000 个字符'); setArticle(value); setSourceName(file.name); setError('');} catch(e) {setError((e as Error).message);}
    }}/></label><span className="article-filename">{sourceName}</span>
    <textarea aria-label="原始文章" placeholder="在这里粘贴文章内容。建议保留原文中的标题、代码与重要结论。" rows={9} value={article} maxLength={30000} disabled={locked} onChange={e => {setArticle(e.target.value); setSourceName('');}}/><div className="article-counter">{article.length.toLocaleString()} / 30,000 字符</div>
    <fieldset disabled={locked}><label>面向受众<select value={audience} onChange={e => setAudience(e.target.value as ArticleRequest['audience'])}><option value="beginner">零基础入门</option><option value="general">普通读者</option><option value="technical">技术读者</option></select></label><label>讲解风格<select value={style} onChange={e => setStyle(e.target.value as ArticleRequest['style'])}><option value="clear">清晰简洁</option><option value="story">问题与例子串联</option><option value="professional">严谨专业</option></select></label><label>目标时长<select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={30}>约 30 秒</option><option value={60}>约 1 分钟</option><option value={90}>约 1.5 分钟</option><option value={180}>约 3 分钟</option><option value={300}>约 5 分钟</option><option value={600}>约 10 分钟</option></select></label><label>分镜数量<select value={sceneCount} onChange={e => setSceneCount(Number(e.target.value))}>{Array.from({length: 10}, (_, i) => <option key={i} value={i + 3}>{i + 3} 个分镜</option>)}</select></label></fieldset>
    <div className="article-privacy">生成将把本文及制作要求发送到你配置的模型服务，可能产生费用。目标时长为估算，最终以 TTS 实测为准。文章不会自动保存，离开页面前请自行保留原文。</div>
    {error && <div className="error" role="alert">{error}</div>}
    <div className="article-actions"><button className="primary" disabled={locked || !model?.configured || article.trim().length < 80} onClick={generate}>{generating ? '正在理解文章、规划分镜…' : draft ? '重新生成（替换待审稿）' : '✦ 生成分镜剧本'}</button>{generating && <button className="secondary" onClick={() => abort.current?.abort()}>取消等待</button>}<span>生成期间不执行配音或视频渲染</span></div>
    {draft && <div className="article-draft"><div className="article-draft-heading"><div><div className="eyebrow">REVIEW BEFORE PRODUCTION</div><h3>{draft.title}</h3><span>{draft.scenes.length} 幕 · 旁白 {draft.scenes.reduce((n, s) => n + s.voiceover.length, 0)} 字 · 字数粗估约 {Math.round(draft.scenes.reduce((n, s) => n + s.voiceover.length, 0) / 4)} 秒</span></div><button className="primary" disabled={locked} onClick={() => {
      if (window.confirm('将待审剧本应用到编辑器？当前未保存的编辑将被替换；磁盘文件仅在你保存后更新。')) onApply(draft);
    }}>应用到编辑器 ↗</button></div><p className="article-review-note">请核对事实、代码与命令结果。模型可能遗漏或误解原文，应用后仍可逐幕编辑。</p><div className="article-scenes">{draft.scenes.map((scene, i) => <div className="article-scene" key={scene.id}><div><span>{String(i + 1).padStart(2, '0')}</span><strong>{templateLabels[scene.template]}</strong><small>{'title' in scene.props ? scene.props.title : scene.props.heading}</small></div><p>{scene.voiceover}</p><p>实际画面：{sceneCapabilities[scene.template].motion}</p><details><summary>查看画面与动作编排</summary><pre>{JSON.stringify({props: scene.props, visual: scene.visual, narration: scene.narration, beats: scene.beats, subtitles: scene.subtitles}, null, 2)}</pre></details></div>)}</div></div>}
  </div>}</section>;
}
