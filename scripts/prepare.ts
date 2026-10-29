import {prepare, readScript} from '../server/pipeline';
await prepare(await readScript(), process.argv.includes('--silent') ? 'silent' : 'tts', console.log);
