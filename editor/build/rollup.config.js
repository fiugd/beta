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

const analyzeConfig = {
	//root: location.origin+'/',
	root: ' ',
	summaryOnly: true,
	limit: 7,
	writeTo: (x) => processWrite('DONE\n\n'+
			chalk.hex('#ccc')(x)
				.replace(/█/g, chalk.hex('#636')('█'))
				.replace(/░/g, chalk.hex('#2a2a43')('█'))
				.replace(/\((.*)\)/g, chalk.hex('#dad')('| $1 \n')) +
			chalk.hex('#aaa')('       . . . [ analysis truncated for brevity ] . . . \n\n\n')
		),
	transformModuleId: (x) => chalk.hex('#dfe')('\n' +
		braces(x.replace(`${location.origin}/crosshj/fiug-beta/`, '')) + '\n'
	)
};


const banner = `/*!
	fiug editor component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/crosshj/fiug/editor
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

const output = {
	format: 'es',
	//sourcemap: true
	//name: 'service-worker-handler.js',
	//format: 'iife',
	// sourcemap: 'inline',
	//minifyInternalExports: true
	file: 'crosshj/fiug-beta/dist/editor.js',
	banner,
};

const root = location.origin + "/crosshj/fiug-beta"

export default {
	input: '/editor/editor.js',
	plugins: [
		resolvePlugin(root),
		json(),
		css(),
		analyze(analyzeConfig),
	],
	external: ['chalk'],
	output,
	onwarn: (warning) => {
		//if (warning.code === 'EVAL') return
		//if (warning.code === 'THIS_IS_UNDEFINED') return;
		//console.log(JSON.stringify(warning, null, 2))
		console.log(chalk.yellow(
			'\nWARNING:\n' +
			warning.message + '\n' +
			`[${warning.loc.line}:${warning.loc.column}] ${braces(warning.id.replace(root+'/', ''))}\n`
		))
	}
};
