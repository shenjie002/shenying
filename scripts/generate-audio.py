"""Content-addressed TTS; sentence timing is measured, not guessed."""
import asyncio
import hashlib
import json
import math
import os
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parents[1]
VOICE = "zh-CN-XiaoxiaoNeural"


async def synthesize(text, voice=VOICE):
    directory = ROOT / "public" / "audio"
    directory.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256((voice + text).encode()).hexdigest()[:32]
    audio = directory / (key + ".mp3")
    if not audio.exists():
        temp = audio.with_suffix(".tmp.mp3")
        for attempt in range(3):
            try:
                await asyncio.wait_for(edge_tts.Communicate(text, voice).save(str(temp)), timeout=90)
                if MP3(str(temp)).info.length <= 0:
                    raise ValueError("音频时长无效")
                os.replace(str(temp), str(audio))
                break
            except Exception:
                if temp.exists():
                    temp.unlink()
                if attempt == 2:
                    raise
                await asyncio.sleep(2 ** attempt)
    duration = MP3(str(audio)).info.length
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError("无效缓存音频：" + str(audio))
    return "audio/" + audio.name, duration


def write_timeline(data):
    target = ROOT / "timeline.json"
    temp = target.with_suffix(".tmp.json")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(str(temp), str(target))


def master_narration(beats, durations, fps):
    """Each beat gets one clip at its absolute start; action frames never move."""
    cursor, timed = 0, []
    for i, (beat, (src, duration)) in enumerate(zip(beats, durations)):
        frames = math.ceil(duration * fps)
        if frames > beat["frames"]:
            raise ValueError("第%d段配音%d帧，超过段长%d帧；请删减该段字幕或加长frames" % (i + 1, frames, beat["frames"]))
        timed.append({"beat": i, "from": cursor, "durationInFrames": frames, "audioSrc": src})
        cursor += beat["frames"]
    return timed, cursor


async def main():
    data = json.loads((ROOT / "script.json").read_text(encoding="utf-8"))
    fps = data["fps"]
    master = data.get("master")
    if master:
        beats, durations = master["beats"], []
        for i, beat in enumerate(beats):
            durations.append(await synthesize(beat["text"].strip(), VOICE))
            print("段落 %d / %d：配音 %d / %d 帧" % (i + 1, len(beats), math.ceil(durations[-1][1] * fps), beat["frames"]), flush=True)
        timed, total = master_narration(beats, durations, fps)
        data.update(scenes=[], masterNarration=timed, mode="tts", totalFrames=total + data["tailPaddingFrames"])
        write_timeline(data)
        return
    for i, scene in enumerate(data["scenes"]):
        voice = scene.get('voice', VOICE)
        if voice not in {VOICE, 'zh-CN-YunxiNeural', 'zh-CN-XiaoyiNeural', 'zh-CN-YunjianNeural'}:
            raise ValueError('不支持的音色')
        segments = scene.get("narration")
        if segments:
            cursor = 0
            timed = []
            seconds = 0
            for segment in segments:
                src, duration = await synthesize(segment["text"].strip(), voice)
                frames = math.ceil(duration * fps)
                timed.append(dict(segment, audioSrc=src, from_frame=cursor, durationInFrames=frames))
                # JSON uses 'from'; Python reserves that keyword.
                timed[-1]["from"] = timed[-1].pop("from_frame")
                cursor += frames + 3
                seconds += duration
            scene["narrationSegments"] = timed
            scene["durationInFrames"] = cursor - 3 + data["tailPaddingFrames"]
            scene["audioDurationSeconds"] = seconds
        else:
            src, duration = await synthesize(scene["voiceover"].strip(), voice)
            scene.update(audioSrc=src, audioDurationSeconds=duration,
                         durationInFrames=math.ceil(duration * fps) + data["tailPaddingFrames"])
        print("分镜 %d / %d：%d 帧" % (i + 1, len(data["scenes"]), scene["durationInFrames"]), flush=True)
    data["totalFrames"] = sum(s["durationInFrames"] for s in data["scenes"])
    data["mode"] = "tts"
    write_timeline(data)


if __name__ == "__main__":
    asyncio.run(main())
