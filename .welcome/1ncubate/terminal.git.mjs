import { chalk, jsonColors } from './terminal.utils.mjs';

import DiffMatchPatch from 'https://cdn.skypack.dev/diff-match-patch';
import Diff from 'https://cdn.skypack.dev/diff-lines';

const link = url => chalk.hex('#9cdcfe')(url)
const bold = chalk.bold.bind(chalk);
const hex = chalk.hex.bind(chalk);
const italic = chalk.italic.bind(chalk);

const commandHelp = (command) => `

${bold('Usage:')} ${command.keyword} ${hex('#BBB')(command.usage||'')}

These are common Git COMMANDs which are supported in some form here:

${hex('#BBB')('start a working area')}
   ${bold('clone')}      Clone a remote repository

${hex('#BBB')('examine the history and state')}
   ${bold('diff')}       Show what changed internally in files
   ${bold('status')}     List all files changed

${hex('#BBB')('grow, mark and tweak your common history')}
   ${bold('branch')}     List, create, or delete branches
   ${bold('commit')}     Record changes to the repository

${hex('#BBB')('collaborate')}
   ${bold('pull')}       Fetch changes from remote
   ${bold('push')}       Update remote with local commits

${italic(`
Online help: ${link('https://github.com/crosshj/fiug/wiki')}
Report bugs: ${link('https://github.com/crosshj/fiug/issues')}
`)}
`;

const config = {
	keyword: "git",
	description: "git is version control.",
	event: "",
	usage: '[COMMAND] [args]',
	args: [
		{ name: 'command', type: String, defaultOption: true }
	],
	map: ({ }) => ({ })
};

const notImplemented = (command) => chalk.hex('#ccc')(`\ngit ${command}: not implemented\n`);

const unrecognizedCommand = (command) => `\n${command}: command not found\n`

const commands = {
	clone: async (term) => term.write(notImplemented('clone')),
	init: async (term) => term.write(notImplemented('init')),

	diff: async (term) => term.write(notImplemented('diff')),
	status: async (term) => term.write(notImplemented('status')),

	branch: async (term) => term.write(notImplemented('branch')),
	commit: async (term) => term.write(notImplemented('commit')),

	fetch: async (term) => term.write(notImplemented('fetch')),
	push: async (term) => term.write(notImplemented('push')),
	pull: async (term) => term.write(notImplemented('pull')),
}

async function invokeRaw(args){}

async function invoke(args, done){
	const { term } = this;
	term.write('\n');
	const { command } = args;
	const thisCommand = commands[command];
	if(!thisCommand) {
		term.write(unrecognizedCommand(`git ${command}`));
		return done();
	}
	await thisCommand(term)
	done();
};

async function exit(){}

const Git = (term, comm) => ({
	...config,
	term,
	comm,
	invoke,
	invokeRaw,
	exit,
	listenerKeys: [],
	args: config.args || [],
	event: Array.isArray(config.event) ? config.event : [config.event],
	required: (config.args || [])
		.filter(x => x.required)
		.map(x => x.name),
	help: () => commandHelp(config),
});

export { Git };
