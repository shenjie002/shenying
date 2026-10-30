import {masterSchema, type Master} from './master';

/** Retiming is piecewise per beat, so later actions stay attached to their content.
 * Rounding collisions are rejected rather than silently dropping authored keys/cues. */
export function resizeMasterBeat(master:Master,index:number,frames:number):Master {
  if(!Number.isInteger(index)||!master.beats[index])throw new Error('无效节奏段');
  if(!Number.isInteger(frames)||frames<20||frames>900)throw new Error('每段时长需为20～900帧');
  const from=master.beats.slice(0,index).reduce((sum,b)=>sum+b.frames,0);
  const old=master.beats[index].frames, end=from+old, delta=frames-old;
  const map=(frame:number)=>frame<=from?frame:frame>=end?frame+delta:from+Math.round((frame-from)*frames/old);
  return masterSchema.parse({...master,
    beats:master.beats.map((b,i)=>i===index?{...b,frames}:b),
    actors:master.actors.map(a=>({...a,keys:a.keys.map(k=>({...k,frame:map(k.frame)}))})),
    camera:master.camera?.map(k=>({...k,frame:map(k.frame)})),
    sfx:master.sfx.map(e=>({...e,frame:map(e.frame)})),
  });
}

export function masterBeatStarts(master:Master):number[] {
  let from=0;
  return master.beats.map(b=>{const start=from;from+=b.frames;return start;});
}
