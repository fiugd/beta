import resolvePlugin from './rollup-plugin-resolve.js';

const entry = `
	import "https://beta.fiug.dev/crosshj/fiug-beta/editor/editor.js";
`;

const banner = `/*!
	fiug editor component
	Version {{VERSION}}
	Build Date {{DATE}}
	https://github.com/crosshj/fiug
	(c) 2020-2021 Harrison Cross.
*/
`;

export default {
	input: 'virtual-module', // resolved by plugin
	plugins: [resolvePlugin(entry)],
	external: ['chalk'],
	output: {
		format: 'es',
		//sourcemap: true
		//name: 'service-worker-handler.js',
		//format: 'iife',
		// sourcemap: 'inline',
		//minifyInternalExports: true
		file: 'crosshj/fiug-beta/dist/editor.js',
		banner,
	},
	onwarn: (warning) => {
		if (warning.code === 'EVAL') return
		if (warning.code === 'THIS_IS_UNDEFINED') return;
		console.log(JSON.stringify(warning, null, 2))
	}
};
