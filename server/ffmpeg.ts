import {spawn} from 'node:child_process';
/** Only application-owned argv; never accepts article text as commands. */
export async function runFfmpeg(args:string[]) {
  await new Promise<void>((resolve,reject)=>{
    const child=spawn('ffmpeg',args,{stdio:['ignore','ignore','pipe']});
    let errors='';child.stderr.on('data',data=>{errors=(errors+String(data)).slice(-4000);});
    child.on('error',()=>reject(new Error('增量合成需要本地ffmpeg，请安装后重试')));
    child.on('exit',code=>code===0?resolve():reject(new Error(`视频合成失败：${errors}`)));
  });
}
