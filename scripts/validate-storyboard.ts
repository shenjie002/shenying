import fs from 'node:fs/promises';
import {parseGenerated} from '../server/article';

const [file, count] = process.argv.slice(2);
if (!file || (count !== undefined && (!/^\d+$/.test(count) || Number(count) < 1 || Number(count) > 30))) {
  console.error('用法：npm run validate:storyboard -- <剧本.json> [分镜数1～30]');
  process.exitCode = 1;
} else {
  try {
    const text = await fs.readFile(file, 'utf8');
    const expected = count === undefined ? JSON.parse(text).scenes?.length : Number(count);
    if (!Number.isInteger(expected) || expected < 1 || expected > 30) throw new Error('剧本必须包含1～30幕');
    const script = parseGenerated(text, expected);
    console.log(`校验通过：${script.title}，${script.scenes.length}幕，其中${script.scenes.filter(scene => scene.template === 'CanvasSlide').length}幕混合画布。`);
    console.log('仅完成格式与动作绑定校验，未写入当前项目；事实、画面裁切及实际音画节奏仍需人工验收。');
  } catch (error) {
    console.error(`校验失败：${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
