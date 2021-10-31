import resolvePlugin from './rollup-plugin-resolve.js';
import json from './rollup-plugin-json.js';
import css from './rollup-plugin-css.js';
import analyze from './rollup-plugin-analyze.js';

import chalk from 'chalk';
chalk.enabled = true;
chalk.level = 3; //levels.trueColor;

const braces = url => {
	const blacklist = ['jsdelivr', 'virtual-module'];
	if(blacklist.find(x => url.includes(x))) return url;
	return `˹${url}˺`;
};

const entry = `
	import "https://beta.fiug.dev/crosshj/fiug-beta/editor/editor.js";
`;

const banner = `/*!
	fiug editor component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/crosshj/fiug/editor
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

export default {
	input: 'virtual-module', // resolved by plugin
	plugins: [
		resolvePlugin(entry),
		json(),
		css(),
		analyze({
			//root: location.origin+'/',
			root: ' ',
			summaryOnly: true,
			limit: 7,
			writeTo: (x) => processWrite('DONE\n\n'+
					chalk.hex('#ccc')(x)
						.replace(/█/g, chalk.hex('#636')('█'))
						.replace(/░/g, chalk.hex('#2a2a43')('█'))
						.replace(/\)/g, ')\n\n') +
					chalk.hex('#aaa')('   . . . [ analysis truncated for brevity ] . . . \n\n')
				),
			transformModuleId: (x) => chalk.hex('#dfe')('\n' +
				braces(x.replace(`${location.origin}/crosshj/fiug-beta/`, '')) + '\n'
			)
		}),
	],
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
