/** Explicit operator action: normalize a local image; no downloads or script writes. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {runFfmpeg} from '../server/ffmpeg';
const file=process.argv[2];if(!file)throw Error('用法：npx tsx scripts/import-image.ts /本地图片路径');
const src=path.resolve(file),stat=await fs.stat(src);
if(!stat.isFile()||stat.size>20*1024*1024)throw Error('仅支持20MB以内本地图片文件');
const bytes=await fs.readFile(src);
const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
if(!png&&!jpg&&!webp)throw Error('只允许PNG/JPEG/WebP，不接收SVG/HTML或其他格式');
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'shenying-image-'));
try{
 const normalized=path.join(temp,'image.png');
 await runFfmpeg(['-hide_banner','-loglevel','error','-i',src,'-frames:v','1','-vf','scale=w=2400:h=2400:force_original_aspect_ratio=decrease','-map_metadata','-1','-y',normalized]);
 const data=await fs.readFile(normalized),hash=createHash('sha256').update(data).digest('hex'),dir=path.resolve('public/images');await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(path.join(dir,hash+'.png'),data,{flag:'wx'}).catch((e:NodeJS.ErrnoException)=>{if(e.code!=='EEXIST')throw e;});
 console.log(JSON.stringify({src:`images/${hash}.png`,note:'本地素材已标准化；自行确认授权与来源，不自动修改剧本。'}));
}finally{await fs.rm(temp,{recursive:true,force:true});}
