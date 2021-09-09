import resolvePlugin from './rollup-plugin-resolve.js';

const entry = `
	import "https://beta.fiug.dev/crosshj/fiug-beta/service-worker/index.js";
`;

const banner = `/*!
	fiug service-worker
	Version {{VERSION}}
	https://github.com/crosshj/fiug
	(c) 20xx-20xx Harrison Cross.

	NOTE: the following is auto-generated via build script, edit at your own peril
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
		//sourcemap: 'inline',
		//minifyInternalExports: true
		file: 'crosshj/fiug-beta/service-worker.js',
		banner,
	},
	onwarn: (warning) => {
		if (warning.code === 'EVAL') return
		if (warning.code === 'THIS_IS_UNDEFINED') return;
		console.log(JSON.stringify(warning, null, 2))
	}
};
