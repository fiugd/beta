import resolvePlugin from './_common/rollup-plugin-resolve.js';
import json from './_common/rollup-plugin-json.js';
import css from './_common/rollup-plugin-css.js';
import analyze from './_common/rollup-plugin-analyze.js';

const banner = `/*!
	fiug terminal component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/fiugd/fiug/terminal
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

export default (root, analyzeConfig, onwarn) => ({
	componentName: 'fiug terminal component',
	input: '/terminal/terminal.js',
	onwarn,
	plugins: [
		resolvePlugin(location.origin + "/" + root),
		json(),
		css(),
		analyze(analyzeConfig),
	],
	external: ['chalk'],
	output: {
		format: 'es',
		file: root + '/dist/terminal.js',
		banner,
	},
	copyFiles: [{
		from: `/${root}/terminal/terminal.html`,
		to: `./${root}/dist/terminal.html`
	}, {
		from: `/${root}/terminal/terminal.css`,
		to: `./${root}/dist/terminal.css`
	}]
});

