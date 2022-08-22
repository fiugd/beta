import build from './build.js';
import commonConfig from './.common.rollup.config.js';

await build(
	commonConfig("actionbar", { html: true, css: true })
);
