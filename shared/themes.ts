export const paletteNames=['blue','editorial','light','vivid','ocean','sunrise','botanical','candy','neon','blueprint','handbook'] as const;
export type Palette=typeof paletteNames[number];
export type Theme={text:string;accent:string;muted:string;warning:string;card:string;background:string;teal:string;rose:string;highlight:string;subtitleBg:string;subtitleFg:string;openStage:boolean;decoration:'none'|'orbits'|'wash'|'grid';radius:number;/** Set at runtime from theme.cinema; palette presets keep the slide-style default. */cinema?:boolean};
const base={teal:'#087b80',rose:'#bb3977',highlight:'#fde047',subtitleBg:'#030814dc',subtitleFg:'#f5f7ff',openStage:false,decoration:'none' as Theme['decoration'],radius:14};
export const themes:Record<Palette,Theme>={
 blue:{...base,text:'#f3f5ff',accent:'#b5caff',muted:'#96a8c9',warning:'#ffcf8b',card:'#101e35',background:'#0b1224',teal:'#74ded3',rose:'#f5a4cc'},
 editorial:{...base,text:'#f5efdc',accent:'#e78c76',muted:'#b9b09d',warning:'#e9cb76',card:'#24231f',background:'#171612',teal:'#90d1b5',rose:'#efa6bf'},
 light:{...base,highlight:'#b45309',text:'#183153',accent:'#285cce',muted:'#526887',warning:'#a55016',card:'#ffffff',background:'#eaf2fc'},
 vivid:{...base,highlight:'#b45309',text:'#28234b',accent:'#7253db',muted:'#685f84',warning:'#b44921',card:'#fff8f2',background:'#f4edff',openStage:true,decoration:'orbits'},
 ocean:{...base,highlight:'#b45309',text:'#103e56',accent:'#086d9a',muted:'#446b7c',warning:'#ad4c22',card:'#f5fffe',background:'#e0f4f7',teal:'#087c69',rose:'#b33c78',openStage:true,decoration:'wash',radius:24},
 sunrise:{...base,highlight:'#b45309',text:'#582e38',accent:'#a43c57',muted:'#805d66',warning:'#9b500b',card:'#fffcf6',background:'#ffeddf',teal:'#27756e',rose:'#ab3e82',openStage:true,decoration:'wash',radius:20},
 botanical:{...base,highlight:'#b45309',text:'#263e2d',accent:'#376b43',muted:'#5c6f59',warning:'#9b531c',card:'#fafbf1',background:'#edf0dd',teal:'#22766e',rose:'#a24464',openStage:true,decoration:'orbits',radius:28},
 candy:{...base,highlight:'#b45309',text:'#41265c',accent:'#853ac0',muted:'#766080',warning:'#a84d17',card:'#fff9ff',background:'#fceaf5',teal:'#087e86',rose:'#b82d6d',openStage:true,decoration:'orbits',radius:30},
 neon:{...base,text:'#f2edff',accent:'#c4a0ff',muted:'#b6a6cd',warning:'#ffd078',card:'#261d40',background:'#130e27',teal:'#62e4d2',rose:'#ff99c8',openStage:true,decoration:'grid',radius:10},
 handbook:{...base,text:'#fbf1e2',accent:'#fbbf24',muted:'#cdb9a1',warning:'#fb923c',card:'#2a221b',background:'#191310',teal:'#86e0cd',rose:'#f7a8c4',highlight:'#fde047',subtitleBg:'#fde047f2',subtitleFg:'#241b12',openStage:true,decoration:'wash',radius:26},
 blueprint:{...base,text:'#eff6ff',accent:'#a6d9ff',muted:'#a8bfd9',warning:'#ffda8a',card:'#173656',background:'#0d2844',teal:'#7ee3d4',rose:'#ffb5cf',openStage:true,decoration:'grid',radius:4},
};
export const paletteDescriptions:Record<Palette,string>={blue:'深蓝技术讲解，传统有框',editorial:'暖黑编辑式，传统有框',light:'蓝白简洁，传统有框',vivid:'紫青橙开放舞台，活泼知识动画',ocean:'海盐青蓝，通透圆角，网络/流转/系统',sunrise:'暖杏珊瑚，柔和开放，生活/人文/故事',botanical:'鼠尾草绿与米色，柔和大圆角，自然/健康/可持续',candy:'粉紫糖果与青色，大圆角，轻松入门/创意',neon:'深紫霓虹，高对比开放，AI/计算/未来概念，不高频闪烁',blueprint:'工程蓝图，细网格与小圆角，结构/架构/流程',handbook:'暖褐手帐感，米白大字与大圆角，琥珀/橙黄高亮，轻松讲解与生活化科普'};
export const paletteGuide=`视觉主题可选：${paletteNames.map(n=>`${n}（${paletteDescriptions[n]}）`).join('；')}。主题名只表示视觉风格，不赋予数据真实性或题材认证；题材匹配仅为建议。全片选一种主theme.palette，不逐幕随机换色；visual.background独立控制低对比纹理。模型可通过布局、形状、tone和连续关键帧自由编排，但不生成任意颜色/CSS/代码。teal/rose/highlight随主题适配深浅，颜色要保持同一对象身份，不用色彩暗示无依据的好坏。新开放主题主要覆盖连续舞台/富文本/外壳，旧代码窗口保留深色、旧图表未完全换肤，不宣称完整视觉样式编辑器。`;
