import {readScript, render} from '../server/pipeline';
await render(await readScript(), console.log, p => process.stdout.write(`\r${Math.round(p * 100)}%`), process.argv.includes('--smoke'), process.argv.includes('--draft'));
