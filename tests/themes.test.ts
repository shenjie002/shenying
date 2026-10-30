import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paletteNames,themes,paletteGuide} from '../shared/themes';
import {themeSchema} from '../shared/presentation';
import {buildMessages} from '../server/article';
import {articleRequestSchema} from '../shared/article';
function luminance(hex:string){const c=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('全部主题可验证且正文/强调/辅助文字在舞台和卡片上有可读对比',()=>{for(const name of paletteNames){assert.ok(themeSchema.safeParse({palette:name}).success);const t=themes[name];for(const key of ['text','accent','muted','warning','teal','rose','highlight'] as const)for(const bg of [t.background,t.card])assert.ok(contrast(t[key],bg)>=3,`${name}.${key}`);}assert.equal(themeSchema.safeParse({palette:'arbitrary-css'}).success,false);});
test('实际生成提示包含全部主题选型与稳定身份规则',()=>{const p=buildMessages(articleRequestSchema.parse({article:'文章资料用于检查视觉风格提示。'.repeat(12)}))[0].content;assert.ok(p.includes(paletteGuide));for(const n of paletteNames)assert.ok(p.includes(n));});
