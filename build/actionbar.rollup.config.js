import resolvePlugin from './_common/rollup-plugin-resolve.js';
import json from './_common/rollup-plugin-json.js';
import css from './_common/rollup-plugin-css.js';
import analyze from './_common/rollup-plugin-analyze.js';

const banner = `/*!
	fiug actionbar component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/fiugd/fiug/actionbar
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

export default (root, analyzeConfig, onwarn) => ({
	componentName: 'fiug actionbar component',
	input: '/actionbar/actionbar.js',
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
		file: root + '/dist/actionbar.js',
		banner,
	},
	copyFiles: [{
		from: `/${root}/actionbar/actionbar.html`,
		to: `./${root}/dist/actionbar.html`
	}, {
		from: `/${root}/actionbar/actionbar.css`,
		to: `./${root}/dist/actionbar.css`
	}],
});
