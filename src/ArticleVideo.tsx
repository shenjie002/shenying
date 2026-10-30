import {ThemeContext,themes} from './components/PresentationContent';
import {MasterCanvas} from './MasterCanvas';
import React from 'react';
import {AbsoluteFill, Audio, Series, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {subtitleAt} from '../shared/subtitles';
import type {TimedScene, Timeline} from '../shared/schema';
import {cameraScale, keywordAt} from '../shared/polish';
import {Background} from './components/Visuals';
import {SceneContent} from './components/SceneContent';

function Slide({scene,index,timeline}: {scene:TimedScene;index:number;timeline:Timeline}) {
  const portrait=timeline.format==='portrait', cinema=timeline.theme?.cinema===true, theme={...themes[timeline.theme?.palette??'blue'],cinema};
  const frame = useCurrentFrame();
  const keyword = keywordAt(scene,frame);
  const scale = cameraScale(scene.visual?.camera,frame,scene.durationInFrames,scene.visual?.animation !== 'none');
  return <ThemeContext.Provider value={theme}><AbsoluteFill style={{color: theme.text, fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', padding: cinema ? (portrait?'48px 40px 210px':'36px 56px 150px') : portrait?'140px 60px 240px':'110px 120px 180px', overflow: 'hidden'}}>
    <Background scene={scene} palette={timeline.theme?.palette}/>
    {!cinema&&<div style={{position: 'absolute', top: portrait?75:48, left: portrait?60:120, color: theme.muted, fontSize: 20, letterSpacing: 3}}>{timeline.theme?.brand??'申映 / KNOWLEDGE IN MOTION'}</div>}
    <div style={{position: 'relative', margin: 'auto 0', width: '100%',transform:`scale(${scale})`,transformOrigin:'center',...(cinema?{margin:'0'}:{})}}><ThemeContext.Provider value={theme}><SceneContent scene={scene}/></ThemeContext.Provider></div>
    {timeline.theme?.chapters&&!cinema&&<div style={{position:'absolute',top:28,left:60,right:60,display:'flex',gap:6}}>{timeline.scenes.map((s,i)=><div key={s.id} style={{flex:1,height:4,background:i<=index?theme.accent:`${theme.muted}30`}}/>)}</div>}
    {scene.chapter&&<div style={{position:'absolute',top:cinema?(portrait?54:34):portrait?112:80,left:portrait?60:120,fontSize:cinema?20:22,letterSpacing:cinema?2:0,color:theme.accent,opacity:cinema?.75:1}}>{scene.chapter}</div>}
    {scene.source&&<div style={{position:'absolute',bottom:portrait?210:155,left:portrait?60:120,right:60,fontSize:18,color:theme.muted}}>来源：{scene.source}</div>}
    {keyword && <div style={{position:'absolute',right:120,top:70,padding:'10px 22px',borderRadius:20,background:`${theme.accent}16`,border:`1px solid ${theme.accent}55`,color:theme.accent,fontSize:26}}>{keyword}</div>}
    {subtitleAt(scene, frame) && <div style={{position: 'absolute', bottom: portrait?135:89, left: portrait?60:180, right: portrait?60:180, textAlign: 'center', pointerEvents: 'none'}}><span style={{display: 'inline-block', fontSize: 32, lineHeight: 1.6, padding: '10px 26px', borderRadius: 22, background: theme.subtitleBg, color: theme.subtitleFg}}>{subtitleAt(scene, frame)}</span></div>}
    {!cinema&&<div style={{position: 'absolute', bottom: portrait?60:42, left: portrait?60:120, right: portrait?60:120, display: 'flex', justifyContent: 'space-between', color: theme.muted, fontSize: 21}}><span>{timeline.theme?.footer??'把知识，讲清楚。'}</span><span>{String(index + 1).padStart(2, '0')} / EXPLAINER</span></div>}
  </AbsoluteFill></ThemeContext.Provider>;
}
export function ArticleVideo({scriptData}: {scriptData: Timeline}) {
  if (scriptData.master) {
    const cinema = scriptData.theme?.cinema === true;
    const masterTheme = {...themes[scriptData.theme?.palette ?? 'blue'], cinema} as any;
    return <ThemeContext.Provider value={masterTheme}><MasterCanvas master={scriptData.master} narration={scriptData.mode === 'tts' ? scriptData.masterNarration : undefined} subtitles/></ThemeContext.Provider>;
  }
  return <AbsoluteFill><Series>{scriptData.scenes.map((scene, index) => <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
    {scene.narrationSegments ? scene.narrationSegments.map((segment, i) => segment.audioSrc && <Sequence key={i} from={segment.from} durationInFrames={segment.durationInFrames} layout="none"><Audio src={staticFile(segment.audioSrc)}/></Sequence>) : scene.audioSrc && <Audio src={staticFile(scene.audioSrc)}/>}
    <Slide scene={scene} index={index} timeline={scriptData}/>
  </Series.Sequence>)}</Series></AbsoluteFill>;
}
