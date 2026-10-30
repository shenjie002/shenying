import {videoSize} from '../shared/presentation';
import {registerRoot, Composition} from 'remotion';
import {ArticleVideo} from './ArticleVideo';
import example from '../script.json';
import {previewTimeline, scriptSchema} from '../shared/schema';
const defaultProps = {scriptData: previewTimeline(scriptSchema.parse(example))};
registerRoot(() => <Composition id="FullArticleVideo" component={ArticleVideo} defaultProps={defaultProps} width={1920} height={1080} fps={30} durationInFrames={defaultProps.scriptData.totalFrames} calculateMetadata={({props}) => ({durationInFrames: props.scriptData.totalFrames, fps: props.scriptData.fps,...videoSize(props.scriptData.format)})}/>);
