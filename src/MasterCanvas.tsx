import React, {useContext} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ActorGraphic} from './components/ActorGraphic';
import {sfxDataUrl, sfxDuration} from '../shared/sfx';
import {ThemeContext} from './components/PresentationContent';
import {actorPose, beatAt, cameraPoseAt, type Master} from '../shared/master';
import type {MasterNarration} from '../shared/schema';

const toneColor = (theme: Record<string, any>, tone: string) =>
  tone === 'teal' ? theme.teal
  : tone === 'rose' ? theme.rose
  : tone === 'normal' ? theme.text
  : tone === 'accent' ? theme.accent
  : tone === 'warning' ? theme.warning
  : tone === 'highlight' ? theme.highlight
  : theme.muted;

/**
 * 单根全局画布：所有演员挂在同一层，关键帧吃绝对帧，镜头在顶层统一推拉。
 * 因此同一对象可以跨“段”延续（标题缩小成角落标签），不需要 scene 拼接。
 */
export function MasterCanvas({master, narration, subtitles = true}: {master: Master; narration?: MasterNarration[]; subtitles?: boolean}) {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const theme = useContext(ThemeContext) as Record<string, any>;
  const k = height / 960;
  const camera = cameraPoseAt(master, frame);
  const beat = beatAt(master, frame);

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: theme.background, color: theme.text, fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', perspective: `${1000 * k}px`, perspectiveOrigin: '50% 46%'}}>
      {!master.sfxMuted&&master.sfx.map((event,i)=><Sequence key={`sfx-${i}`} from={event.frame} durationInFrames={Math.ceil(sfxDuration[event.sound]*30)} layout="none"><Audio src={sfxDataUrl(event.sound)} volume={event.gain}/></Sequence>)}
      {narration?.map(clip=><Sequence key={`vo-${clip.beat}`} from={clip.from} durationInFrames={clip.durationInFrames} layout="none"><Audio src={staticFile(clip.audioSrc)}/></Sequence>)}
      {master.backdrop !== 'none' && (
        <AbsoluteFill style={{
          background: master.backdrop === 'grid'
            ? `linear-gradient(${theme.card}22 1px, transparent 1px) 0 0/64px 64px, linear-gradient(90deg, ${theme.card}22 1px, transparent 1px) 0 0/64px 64px, ${theme.background}`
            : `radial-gradient(120% 90% at ${20 + camera.x * 0.5}% ${30 + camera.y * 0.4}%, ${theme.highlight}2b, transparent 62%), radial-gradient(90% 70% at 78% 80%, ${theme.accent}22, transparent 58%), ${theme.background}`,
          transform: `translate(${(50 - camera.x) * 0.16}%, ${(50 - camera.y) * 0.14}%) scale(${1 + (camera.zoom - 1) * 0.3})`,
        }}/>
      )}

      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d'}}>
        {master.actors.map((actor, index) => {
          const pose = actorPose(actor, frame);
          if (pose.opacity <= 0.001) return null;
          const color = toneColor(theme, actor.tone);
          const drift = actor.float > 0 ? Math.sin(frame / 46 + index * 1.6) * actor.float : 0;
          const boxed = ['card','chip','line'].includes(actor.kind);
          // 近大远小 + 视差：每层的镜头响应强度由 depth 决定，而不是全舞台统一缩放
          const par = actor.depth;
          const camScale = 1 + (camera.zoom - 1) * par;
          const px = pose.x + (50 - camera.x) * 0.62 * par;
          const py = pose.y + (50 - camera.y) * 0.62 * par;
          const zPx = pose.z * k;
          // 离观众越近，投影越大越散；远处收紧
          const near = Math.max(0, (zPx + (camera.zoom - 1) * 420 * k) / (420 * k));
          const shadowY = (10 + near * 22) * k;
          const shadowBlur = (18 + near * 34) * k;
          const shadowAlpha = Math.min(0.8,0.26 + near * 0.3);
          return (
            <div key={actor.id} style={{
              position: 'absolute',
              left: `${px}%`, top: `${py}%`,
              width: `${actor.width}%`,
              transformStyle: 'preserve-3d',
              transform: `translate(-50%, -50%) translateZ(${zPx}px) translateY(${drift * k}px) scale(${pose.scale * camScale}) rotateX(${pose.rotateX}deg) rotateY(${pose.rotateY}deg) rotate(${pose.rotate}deg)`,
              boxSizing: 'border-box',
              opacity: Math.min(1,Math.max(0,pose.opacity)),
              textAlign: actor.kind === 'card' ? 'left' : 'center',
              ...(boxed ? {
                padding: `${14 * k}px ${18 * k}px`,
                borderRadius: actor.kind === 'chip' ? `${999}px` : `${(theme.radius ?? 18) * k}px`,
                background: actor.kind === 'line' ? 'transparent' : `${theme.card}f2`,
                border: `${1.5 * k}px solid ${color}59`,
                borderLeft: actor.kind === 'line' ? `${4 * k}px solid ${color}` : undefined,
                boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha.toFixed(2)}), 0 ${(shadowY * 0.4).toFixed(1)}px ${(shadowBlur * 0.35).toFixed(1)}px rgba(0,0,0,.28)`,
                backdropFilter: 'blur(14px)',
              } : {}),
            }}>
              {actor.badge && (
                <div style={{
                  display: 'inline-block', marginBottom: `${8 * k}px`,
                  padding: `${3 * k}px ${9 * k}px`, borderRadius: `${999}px`,
                  fontSize: `${13 * k}px`, letterSpacing: `${1 * k}px`,
                  color, background: `${color}24`, border: `${1 * k}px solid ${color}59`,
                }}>{actor.badge}</div>
              )}
              <ActorGraphic actor={actor} progress={pose.progress} frame={frame} color={color} k={k}/>
              {actor.kind !== 'doodle' && <div style={{
                fontSize: `${actor.fontSize * k}px`,
                fontWeight: actor.fontWeight,
                lineHeight: 1.16,
                color: actor.kind === 'card' || actor.kind === 'line' ? theme.text : color,
                textShadow: actor.glow ? `0 0 ${26 * k}px ${color}66` : undefined,
                letterSpacing: `${(actor.fontSize > 52 ? -0.6 : 0) * k}px`,
                whiteSpace:'pre-line',
                overflowWrap:'break-word',
              }}>{actor.label}</div>}
              {actor.detail && (
                <div style={{fontSize: `${17 * k}px`, marginTop: `${6 * k}px`, color: theme.muted, lineHeight: 1.35}}>{actor.detail}</div>
              )}
            </div>
          );
        })}
      </div>

      {subtitles && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: `${46 * k}px`,
          display: 'flex', justifyContent: 'center', padding: `0 ${34 * k}px`,
        }}>
          <div style={{
            maxWidth: '86%', textAlign: 'center',
            fontSize: `${21 * k}px`, lineHeight: 1.5, fontWeight: 600,
            color: theme.subtitleFg ?? theme.background,
            background: theme.subtitleBg ?? theme.highlight,
            padding: `${8 * k}px ${16 * k}px`, borderRadius: `${999}px`,
            boxShadow: `0 ${8 * k}px ${22 * k}px rgba(0,0,0,.32)`,
          }}>{beat.beat.text}</div>
        </div>
      )}
    </AbsoluteFill>
  );
}
