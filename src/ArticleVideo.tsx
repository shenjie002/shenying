import React from 'react';
import {AbsoluteFill, Audio, Series, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {subtitleAt} from '../shared/subtitles';
import type {TimedScene, Timeline} from '../shared/schema';
import {cameraScale, keywordAt} from '../shared/polish';
import {Background} from './components/Visuals';
import {SceneContent} from './components/SceneContent';

function Slide({scene, index}: {scene: TimedScene; index: number}) {
  const frame = useCurrentFrame();
  const keyword = keywordAt(scene,frame);
  const scale = cameraScale(scene.visual?.camera,frame,scene.durationInFrames,scene.visual?.animation !== 'none');
  return <AbsoluteFill style={{color: '#f3f5ff', fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', padding: '110px 120px 180px', overflow: 'hidden'}}>
    <Background scene={scene}/>
    <div style={{position: 'absolute', top: 48, left: 120, color: '#a0adce', fontSize: 20, letterSpacing: 3}}>申映 / KNOWLEDGE IN MOTION</div>
    <div style={{position: 'relative', margin: 'auto 0', width: '100%',transform:`scale(${scale})`,transformOrigin:'center'}}><SceneContent scene={scene}/></div>
    {keyword && <div style={{position:'absolute',right:120,top:70,padding:'10px 22px',borderRadius:20,background:'#b5c6ff22',border:'1px solid #b5c6ff55',color:'#d6e1ff',fontSize:26}}>{keyword}</div>}
    {subtitleAt(scene, frame) && <div style={{position: 'absolute', bottom: 89, left: 180, right: 180, textAlign: 'center', pointerEvents: 'none'}}><span style={{display: 'inline-block', fontSize: 32, lineHeight: 1.6, padding: '8px 24px', borderRadius: 12, background: '#030814dc', color: '#f5f7ff'}}>{subtitleAt(scene, frame)}</span></div>}
    <div style={{position: 'absolute', bottom: 42, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', color: '#92a0c1', fontSize: 21}}><span>把知识，讲清楚。</span><span>{String(index + 1).padStart(2, '0')} / EXPLAINER</span></div>
  </AbsoluteFill>;
}
export function ArticleVideo({scriptData}: {scriptData: Timeline}) {
  return <AbsoluteFill><Series>{scriptData.scenes.map((scene, index) => <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
    {scene.narrationSegments ? scene.narrationSegments.map((segment, i) => segment.audioSrc && <Sequence key={i} from={segment.from} durationInFrames={segment.durationInFrames} layout="none"><Audio src={staticFile(segment.audioSrc)}/></Sequence>) : scene.audioSrc && <Audio src={staticFile(scene.audioSrc)}/>}
    <Slide scene={scene} index={index}/>
  </Series.Sequence>)}</Series></AbsoluteFill>;
}
