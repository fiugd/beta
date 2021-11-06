import resolvePlugin from './rollup-plugin-resolve.js';
import json from './rollup-plugin-json.js';
import css from './rollup-plugin-css.js';
import analyze from './rollup-plugin-analyze.js';

import chalk from 'chalk';
chalk.enabled = true;
chalk.level = 3; //levels.trueColor;

const braces = url => {
	const blacklist = ['jsdelivr', 'skypack.dev', 'unpkg', 'virtual-module'];
	if(blacklist.find(x => url.includes(x))) return url;
	return `˹${url}˺`;
};

const analyzeConfig = (root) => ({
	//root: location.origin+'/',
	root: ' ', // << so that externals are not filtered out, and process.env does not exist...
	summaryOnly: true,
	limit: 7,
	writeTo: (x) => processWrite('DONE\n\n'+
			chalk.hex('#ccc')(x)
				.replace(/█/g, chalk.hex('#636')('█'))
				.replace(/░/g, chalk.hex('#2a2a43')('█'))
				.replace(/\((.*)\)/g, chalk.hex('#dad')('| $1')) +
			chalk.hex('#aaa')('\n\n       . . . [ analysis truncated for brevity ] . . . \n\n\n')
		),
	transformModuleId: (x) => chalk.hex('#dfe')('\n' +
		braces(x.replace(`${location.origin}/${root}/`, '')) + '\n'
	)
});


const banner = `/*!
	fiug terminal component
	Version {{VERSION}} ( {{DATE}} )
	https://github.com/fiugd/fiug/terminal
	(c) 2020-2021 Harrison Cross, MIT License
*/
`;

const onwarn = (root) => (warning) => {
	//if (warning.code === 'EVAL') return
	//if (warning.code === 'THIS_IS_UNDEFINED') return;
	//console.log(JSON.stringify(warning, null, 2))
	const message = [
		'\nWARNING:\n',
		warning.message, '\n',
		warning.loc ? `[${warning.loc.line}:${warning.loc.column}] ` : '',
		warning.id ? `${braces(warning.id.replace(root+'/', ''))}\n` : '',
	].join('');
	console.log(chalk.yellow(message));
}

export default (root) => ({
	input: '/terminal/terminal.js',
	plugins: [
		resolvePlugin(location.origin + "/" + root),
		json(),
		css(),
		analyze(analyzeConfig(root)),
	],
	external: ['chalk'],
	output: {
		format: 'es',
		file: root + '/dist/terminal.js',
		banner,
	},
	onwarn: onwarn(root)
});