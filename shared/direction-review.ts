import type {Script} from './schema';
import {canvasLeaves} from './canvas';

/** Advisory only: never force decorative variety or reject legitimate repetition. */
export function directionWarnings(script:Script): string[] {
  const warnings:string[]=[];
  script.scenes.forEach((scene,i)=>{
    if(scene.template!=='CanvasSlide') return;
    const blocks=canvasLeaves(scene.props.blocks);
    if(blocks.length>4) warnings.push(`分镜${i+1}：${blocks.length}个内容块，请检查阅读负担；不是要求凑满组件。`);
    if(blocks.some(b=>b.type==='MechanismBlock') && blocks.length>1 && scene.props.layout!=='stacked') warnings.push(`分镜${i+1}：状态演示位于分栏中，请检查文字与关系线是否可读，优先单块全宽。`);
    if(i>=2 && script.scenes.slice(i-2,i+1).every(s=>s.template==='CanvasSlide'&&s.props.layout==='split-2-1')) warnings.push(`分镜${i-1}～${i+1}连续使用左右2:1布局：确认是否有必要，不为多样性强行改布局。`);
  });
  return warnings;
}
