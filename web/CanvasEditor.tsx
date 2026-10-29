import {CanvasOverview} from './CanvasOverview';
import {useState} from 'react';
import {canvasPropsSchema} from '../shared/canvas';
import type {Scene} from '../shared/schema';

type CanvasScene = Extract<Scene, {template: 'CanvasSlide'}>;
export function CanvasEditor({scene, onChange}: {scene: CanvasScene; onChange: (scene: Scene) => void}) {
  const [text, setText] = useState(() => JSON.stringify(scene.props, null, 2));
  const [error, setError] = useState('');
  return <div><CanvasOverview scene={scene}/><details className="canvas-json-details"><summary>高级编辑：画布布局 JSON</summary><p>修改结构后需先应用；组合说明展示的是已应用的布局。此版不是拖拽画布。</p><textarea aria-label="画布布局 JSON" className="code-input" rows={16} value={text} onChange={e => setText(e.target.value)}/><button type="button" className="secondary" onClick={() => {
    try {const props = canvasPropsSchema.parse(JSON.parse(text)); onChange({...scene, props}); setError('');} catch (e) {setError((e as Error).message);}
  }}>校验并应用画布布局</button><p>布局编辑需先点击应用，再保存剧本；修改块顺序后请重新核对旁白 target。</p>{error && <p role="alert">{error}</p>}</details></div>;
}
