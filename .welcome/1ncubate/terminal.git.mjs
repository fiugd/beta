/*

https://medium.com/@mehulgala77/github-fundamentals-clone-fetch-push-pull-fork-16d79bb16b79
https://googlechrome.github.io/samples/service-worker/post-message/

*/
import DiffMatchPatch from 'https://cdn.skypack.dev/diff-match-patch';
import Diff from 'https://cdn.skypack.dev/diff-lines';
import { chalk, jsonColors } from './terminal.utils.mjs';

const fetchJSON = (url, opts) => fetch(url, opts).then(x => x.json());

const link = url => chalk.hex('#9cdcfe')(url)
const [ bold, hex, italic ] = [
	chalk.bold.bind(chalk),
	chalk.hex.bind(chalk),
	chalk.italic.bind(chalk),
];

const commandHelp = (command) => `

${bold('Usage:')} ${command.keyword} ${hex('#BBB')(command.usage||'')}

These are common Git COMMANDs which are supported in some form here:

${hex('#BBB')('start a working area')}
   ${bold('clone')}      Copy a remote repository to local

${hex('#BBB')('examine the history and state')}
   ${bold('diff')}       Show local changes per file
   ${bold('status')}     List all files changed locally

${hex('#BBB')('grow, mark and tweak your common history')}
   ${bold('branch')}     List, create, or delete branches
   ${bold('commit')}     Record changes to the repository

${hex('#BBB')('collaborate')}
   ${bold('pull')}       Fetch recent changes from remote
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

const clone = async (term) => {
	// do what settings does when it clones a github repo
	term.write(notImplemented('clone'));
}
const diff = async (term) => {
	// get all changed files
	// write diff to terminal
	term.write(notImplemented('diff'));
};
const status = async ({ term }) => {
	const cwd = '.welcome/1ncubate';
	const changesUrl = "/service/change";
	const changesResponse = await fetchJSON(changesUrl
		+"?cwd=" + cwd
	);

	if(!changesResponse.changes.length){
		return term.write('no changes!');
	}
	term.write('\n' +
		changesResponse.changes.map(x => 
			'   ' + chalk.bold('modified: ') + x.fileName
		).join('\n')
	+ '\n');
};
const branch = async ({ term }) => term.write(notImplemented('branch'));
const commit = async ({ term }) => term.write(notImplemented('commit'));
const push = async ({ term }) => term.write(notImplemented('push'));
const pull = async ({ term }) => term.write(notImplemented('pull'));

const commands = { clone, diff, status, branch, commit, push, pull };

async function invokeRaw(args){}

async function invoke(args, done){
	const { term } = this;
	const { command } = args;
	if(!command){
		term.write(this.help());
		done();
		return
	}
	term.write('\n');
	const thisCommand = commands[command];
	if(!thisCommand) {
		term.write(unrecognizedCommand(`git ${command}`));
		return done();
	}
	await thisCommand(this)
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
