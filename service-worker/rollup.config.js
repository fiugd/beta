import resolvePlugin from './rollup-plugin-resolve.js';

const entry = `
	import Handler from "https://beta.fiug.dev/crosshj/fiug-beta/service-worker/handler.js";
	Handler();
`;

export default {
	input: 'virtual-module', // resolved by plugin
	plugins: [resolvePlugin(entry)],
	external: ['chalk'],
	output: {
		//format: 'es',
		//sourcemap: true
		//name: 'service-worker-handler.js',
		format: 'iife',
		//sourcemap: 'inline',
		//minifyInternalExports: true
	},
	onwarn: (warning) => { console.log(JSON.stringify(warning, null, 2)) }
};
