import type {Mechanism} from './mechanism';
type Step=Mechanism['steps'][number];
const slot=(step:Step,id:string,ids:string[])=>step.states.find(s=>s.entity===id)?.slot??ids.indexOf(id)+1;
/** Vacant-slot moves interpolate; occupied-slot exchanges fade to avoid crossing cards. */
export function entityMotion(previous:Step,current:Step,id:string,ids:string[],progress:number) {
  const t=Math.max(0,Math.min(1,progress));
  const from=slot(previous,id,ids),to=slot(current,id,ids);
  const occupied=from!==to&&previous.states.some(s=>s.entity!==id&&s.visible!==false&&slot(previous,s.entity,ids)===to);
  const old=previous.states.find(s=>s.entity===id)!,next=current.states.find(s=>s.entity===id)!;
  const visibility=(old.visible===false?0:1)*(1-t)+(next.visible===false?0:1)*t;
  return {slot:occupied?(t<.5?from:to):from+(to-from)*t,opacity:visibility*(occupied?Math.abs(2*t-1):1)};
}
