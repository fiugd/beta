import { chalk, jsonColors } from './terminal.utils.mjs';

const commands = [
	{
		name: 'PrintWorkingDir',
		keyword: "pwd",
		description: "Print current working directory.",
		event: "showCurrentFolder",
	},
	{
		name: 'ChangeDir',
		keyword: "cd",
		description: "Change current working directory to DIRECTORY (home by default).",
		event: "changeCurrentFolder",
		usage: '[DIRECTORY]',
		args: [
			{ name: 'directory', type: String, defaultOption: true, defaultValue: '~' }
		],
	},
	{
		name: 'MakeDir',
		keyword: "md",
		description: "Create a DIRECTORY if not existing (recursively).",
		event: "addFolder",
		usage: '[DIRECTORY]',
		args: [
			{ name: 'directory', type: String, defaultOption: true, required: true }
		],
	},
	{
		name: 'List',
		keyword: "ls",
		description: "List contents of a DIRECTORY (current by default).",
		event: "readFolder",
		usage: '[-al] [DIRECTORY]',
		args: [
			{ name: 'directory', type: String, defaultOption: true, defaultValue: '.' },
			{ name: 'all', type: Boolean, alias: 'a' },
			{ name: 'long', type: Boolean, alias: 'l' },
		],
	},
	{
		name: 'Remove',
		keyword: "rm",
		description: "Remove FILE, or DIRECTORY with --recursive (-r) option.",
		event: ["deleteFile", "deleteFolder"],
		usage: '[-rf] [FILE|DIRECTORY]',
		args: [
			{ name: 'file', type: String, defaultOption: true, required: true },
			{ name: 'recursive', type: Boolean, alias: 'r' },
			{ name: 'force', type: Boolean, alias: 'f' },
		],
	},
	{
		name: 'Move',
		keyword: "mv",
		description: 'Move SOURCE to DESTINATION.',
		event: ["moveFile", "moveFolder"],
		usage: '[SOURCE] [DESTINATION]',
		args: [
			{ name: 'source', type: String, required: true },
			{ name: 'dest', type: Boolean, required: true },
		],
		argsGet: ([ target, destination ]) => ({ target, destination }),
	},
	{
		name: 'Touch',
		keyword: "touch",
		description: `Officially, updates access time of FILE. Here, creates FILE.`,
		event: "addFile",
		usage: '[FILE]',
		args: [
			{ name: 'file', type: String, defaultOption: true, required: true }
		],
	},
	{
		name: 'Concat',
		keyword: "cat",
		description: 'Concatenate(print) FILE contents to standard output.',
		event: "",
		usage: '[FILE]',
		args: [
			{ name: 'file', type: String, defaultOption: true, required: true }
		],
	},
];

const link = url => chalk.hex('#9cdcfe')(url)

const commandHelp = (command) => `

${chalk.bold('Usage:')} ${command.keyword} ${chalk.hex('#BBB')(command.usage||'')}

${command.description || 'MISSING DESCRIPTION: bug someone to add a description.'}

  -?, --????   ${chalk.hex('#BBB')('TODO')}        TODO: add args description
  -h, --help   ${/* SPACER                */''}    Prints this guide

${chalk.bold('Examples:')}
  TODO: add examples

${chalk.italic(`
Online help: ${link('https://github.com/crosshj/fiug/wiki')}
Report bugs: ${link('https://github.com/crosshj/fiug/issues')}
`)}
`;

const notImplemented = ({ keyword }) => chalk.hex('#ccc')(`\n${keyword}: not implemented\n`);

const operationsListener = (...args) => {
	// check queue for who is listening
	// fire the Promise.resolve for that listener
	console.log(args);
};

async function exec(data){
	return await this.comm.execute(data);
}

async function invoke(args, done){
	this.term.write('\n');
	const ackEventTrigger = await this.exec({
		triggerEvent: {
			type: 'operations',
			detail: {
				source: 'TerminalWIP',
				operation: this.event[0], //TODO:
				//data: this.args
			},
		}
	});
	// await real event response from operationsListener
	this.term.write(jsonColors(ackEventTrigger));
	this.term.write(notImplemented(this));
	done();
};
async function exit(){}

const Operation = (config, term, comm) => ({
	...config,
	term,
	comm,
	invoke,
	exec,
	exit,
	listenerKeys: [],
	args: config.args || [],
	event: Array.isArray(config.event) ? config.event : [config.event],
	required: (config.args || [])
		.filter(x => x.required)
		.map(x => x.name),
	help: () => commandHelp(config)
});

const GetOps = (term, comm) => {
	comm.attach({
		name: 'TerminalWIP',
		listener: operationsListener,
		eventName: 'operations',
	});
	const opmap = config => Operation(config, term, comm)
	return commands.map(opmap);
};

export default GetOps;
