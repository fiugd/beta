import resolvePlugin from './_common/rollup-plugin-resolve.js';
import json from './_common/rollup-plugin-json.js';
import css from './_common/rollup-plugin-css.js';
import analyze from './_common/rollup-plugin-analyze.js';

const banner = `/*!
	fiug tree component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/fiugd/fiug/terminal
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

export default (root, analyzeConfig, onwarn) => ({
	componentName: 'fiug tree component',
	input: '/tree/tree.js',
	onwarn,
	plugins: [
		resolvePlugin(location.origin + "/" + root),
		json(),
		css(),
		analyze(analyzeConfig),
	],
	external: [],
	output: {
		format: 'es',
		file: root + '/dist/tree.js',
		banner,
	},
	copyFiles: [{
		from: `/${root}/tree/tree.html`,
		to: `./${root}/dist/tree.html`
	}, {
		from: `/${root}/tree/tree.css`,
		to: `./${root}/dist/tree.css`
	}]
});

