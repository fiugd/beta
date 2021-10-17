import { transpile, WorkerRewrite } from './worker.rewrite.js';

const content = `
import 'rollup';
import 'sourceMap';
import 'terser';

import rollupConfig from '/crosshj/fiug-beta/service-worker/build/rollup.config.js';
import terserConfig from '/crosshj/fiug-beta/service-worker/build/terser.config.js';
import packageJson from "/crosshj/fiug-beta/package.json" assert { type: "json" };
`;
const map = {
	imports: {
		rollup: 'https://unpkg.com/rollup/dist/rollup.browser.js',
		sourceMap: 'https://cdn.jsdelivr.net/npm/source-map@0.7.3/dist/source-map.js',
		terser: 'https://cdn.jsdelivr.net/npm/terser/dist/bundle.min.js',
	}
};

console.log(transpile(content, map));
