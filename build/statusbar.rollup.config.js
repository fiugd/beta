import resolvePlugin from './_common/rollup-plugin-resolve.js';
import json from './_common/rollup-plugin-json.js';
import css from './_common/rollup-plugin-css.js';
import analyze from './_common/rollup-plugin-analyze.js';

const banner = `/*!
	fiug statusbar component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/fiugd/fiug/statusbar
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

export default (root, analyzeConfig, onwarn) => ({
	componentName: 'fiug statusbar component',
	input: '/statusbar/statusbar.js',
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
		file: root + '/dist/statusbar.js',
		banner,
	},
	copyFiles: [{
		from: `/${root}/statusbar/statusbar.html`,
		to: `./${root}/dist/statusbar.html`
	}, {
		from: `/${root}/statusbar/statusbar.css`,
		to: `./${root}/dist/statusbar.css`
	}],
});
