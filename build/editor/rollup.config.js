import resolvePlugin from '../_common/rollup-plugin-resolve.js';
import json from '../_common/rollup-plugin-json.js';
import css from '../_common/rollup-plugin-css.js';
import analyze from '../_common/rollup-plugin-analyze.js';

export default (root) => ({
	componentName: 'fiug editor component',
	input: '/editor/editor.js',
	plugins: [
		resolvePlugin(location.origin + "/" + root),
		json(),
		css(),
		analyze(analyzeConfig(root)),
	],
	external: ['chalk'],
	output: {
		format: 'es',
		//sourcemap: true
		//name: 'service-worker-handler.js',
		//format: 'iife',
		// sourcemap: 'inline',
		//minifyInternalExports: true
		file: root + '/dist/editor.js',
		banner,
	},
	copyFiles: [{
		from: `/${root}/editor/editor.html`,
		to: `./${root}/dist/editor.html`
	}],
	onwarn: onwarn(root)
});
