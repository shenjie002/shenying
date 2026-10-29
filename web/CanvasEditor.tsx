import {useState} from 'react';
import {canvasPropsSchema} from '../shared/canvas';
import type {Scene} from '../shared/schema';

type CanvasScene = Extract<Scene, {template: 'CanvasSlide'}>;
export function CanvasEditor({scene, onChange}: {scene: CanvasScene; onChange: (scene: Scene) => void}) {
  const [text, setText] = useState(() => JSON.stringify(scene.props, null, 2));
  const [error, setError] = useState('');
  return <div><p>混合画布：分栏 / 网格 / 堆叠，可嵌套 GroupBlock。内容块 target 按深度优先顺序从 1 编号。此版使用结构化 JSON 编辑，不是拖拽画布。</p><textarea aria-label="画布布局 JSON" className="code-input" rows={16} value={text} onChange={e => setText(e.target.value)}/><button type="button" className="secondary" onClick={() => {
    try {const props = canvasPropsSchema.parse(JSON.parse(text)); onChange({...scene, props}); setError('');} catch (e) {setError((e as Error).message);}
  }}>校验并应用画布布局</button><p>布局编辑需先点击应用，再保存剧本；修改块顺序后请重新核对旁白 target。</p>{error && <p role="alert">{error}</p>}</div>;
}
