import resolvePlugin from './_common/rollup-plugin-resolve.js';
import json from './_common/rollup-plugin-json.js';
import css from './_common/rollup-plugin-css.js';
import analyze from './_common/rollup-plugin-analyze.js';

const banner = (MODULENAME) => `/*!
	fiug ${MODULENAME} component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/fiugd/fiug/${MODULENAME}
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

export default (MODULENAME, { html: copyHTML, css: copyCSS }={}) => {
	return (root, analyzeConfig, onwarn) => ({
		componentName: `fiug ${MODULENAME}`,
		input: `/${MODULENAME}/${MODULENAME}.js`,
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
			file: root + `/dist/${MODULENAME}.js`,
			banner: banner(MODULENAME),
		},
		copyFiles: [
			copyHTML && {
				from: `/${root}/${MODULENAME}/${MODULENAME}.html`,
				to: `./${root}/dist/${MODULENAME}.html`
			},
			copyCSS && {
				from: `/${root}/${MODULENAME}/${MODULENAME}.css`,
				to: `./${root}/dist/${MODULENAME}.css`
			}
		].filter(x => x),
	});
};

