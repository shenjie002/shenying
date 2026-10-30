import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {TimedScene} from '../shared/schema';
export const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function sceneRenderKey(scene:TimedScene,index:number,fps:number,profile:unknown,engine:string) {
  // Absolute offset intentionally excluded: local scene animation is independent of earlier duration.
  return digest({version:1,scene,index,fps,profile,engine});
}
export async function engineFingerprint(root:string) {
  const files:string[]=[];
  const walk=async(dir:string)=>{for(const e of (await fs.readdir(path.join(root,dir),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=path.join(dir,e.name);if(e.isDirectory())await walk(name);else if(/\.(tsx?|css)$/.test(name))files.push(name);}};
  // Only pixel-affecting code: server orchestration (pipeline) must not invalidate rendered frames.
  await walk('src');await walk('shared');files.push('package-lock.json');
  const h=createHash('sha256');for(const f of files)h.update(f).update(await fs.readFile(path.join(root,f)));return h.digest('hex');
}
export async function cachedScene(file:string,produce:(temporary:string)=>Promise<void>) {
  try {if((await fs.stat(file)).size>0)return true;}catch{}
  const temporary=file+'.tmp.mp4';
  try{await produce(temporary);await fs.rename(temporary,file);}catch(error){await fs.rm(temporary,{force:true});throw error;}
  return false;
}
