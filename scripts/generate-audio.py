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


async def synthesize(text):
    directory = ROOT / "public" / "audio"
    directory.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256((VOICE + text).encode()).hexdigest()[:32]
    audio = directory / (key + ".mp3")
    if not audio.exists():
        temp = audio.with_suffix(".tmp.mp3")
        for attempt in range(3):
            try:
                await asyncio.wait_for(edge_tts.Communicate(text, VOICE).save(str(temp)), timeout=90)
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


async def main():
    data = json.loads((ROOT / "script.json").read_text(encoding="utf-8"))
    fps = data["fps"]
    for i, scene in enumerate(data["scenes"]):
        segments = scene.get("narration")
        if segments:
            cursor = 0
            timed = []
            seconds = 0
            for segment in segments:
                src, duration = await synthesize(segment["text"].strip())
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
            src, duration = await synthesize(scene["voiceover"].strip())
            scene.update(audioSrc=src, audioDurationSeconds=duration,
                         durationInFrames=math.ceil(duration * fps) + data["tailPaddingFrames"])
        print("分镜 %d / %d：%d 帧" % (i + 1, len(data["scenes"]), scene["durationInFrames"]), flush=True)
    data["totalFrames"] = sum(s["durationInFrames"] for s in data["scenes"])
    data["mode"] = "tts"
    target = ROOT / "timeline.json"
    temp = target.with_suffix(".tmp.json")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(str(temp), str(target))


if __name__ == "__main__":
    asyncio.run(main())
