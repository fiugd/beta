import { chalk, jsonColors } from './terminal.utils.js';

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
		map: ({ directory }) => ({ folderPath: directory }),
		mapResponse: () => '',
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
		map: ({ directory }) => ({ folderName: directory })
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
		mapResponse: (res) => {
			return res
				.filter(x => x)
				.sort((a,b) => {
					const bothFolders = a.includes('/') && b.includes('/');
					const bothFiles = !a.includes('/') && !b.includes('/');
					if(bothFolders || bothFiles){
						return a.toLowerCase().localeCompare(b.toLowerCase());
					}
					if(a.includes('/') && !b.includes('/')) return -1;
					if(!a.includes('/') && b.includes('/')) return 1;
				})
				.join('\n') + '\n'
		}
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
		map: (args) => ({
			...args,
			filename: args.file,
			parent: args.cwd || ''
		}),
		mapResponse: (res) => '',
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
		map: ({ file, cwd }) => ({
			filename: file,
			name: file,
			parent: cwd || ''
		}),
		mapResponse: (res) => ''
	},
	{
		name: 'Concat',
		keyword: "cat",
		description: 'Concatenate(print) FILE contents to standard output.',
		event: "readFile",
		usage: '[FILE]',
		args: [
			{ name: 'file', type: String, defaultOption: true, required: true }
		],
	},
];

const getStatefulHandlers = (state, { changeFolder }) => ({
	showCurrentFolder: {
		response: () => state.cwd,
		update: (res, service) => {
			state.cwd = res;
			state.service = service;
		}
	},
	changeCurrentFolder: {
		response: ({ folderPath }) => changeFolder(state, folderPath)
	}
});

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

const readFile = async (args) => {
	const { file, cwd } = args;
	let response, error;
	try {
		response = await (await fetch(`/${cwd}/${file}`)).text();
	} catch(e) {
		error = JSON.stringify(e, null, 2);
	}
	return { response, error };
};

const manualCommands = { readFile };

const changeFolder = (state, folderPath) => {
	if(!state.cwd || !state.service) return;

	if(folderPath.slice(0,2) === '..'){
		//TODO: handle multiple, eg.  '../../'
		let newCwd = state.cwd.split('/').slice(0,-1).join('/') + folderPath.slice(2);
		try {
			if(!newCwd.includes(state.service.trim())) return state.cwd;
			state.cwd = newCwd;
		} catch(e){}

		return state.cwd;
	}

	if(folderPath[0] === '/'){
		try{
			if(folderPath.length === 1){
				state.cwd = state.service.trim();
				return state.cwd;
			}
			state.cwd = state.service.trim() + folderPath;
		} catch(e) {}

		return state.cwd;
	}

	if(folderPath.slice(0,2) === './'){
		state.cwd += folderPath.slice(1);
		return state.cwd;
	}

	state.cwd += '/' + folderPath;
	return state.cwd;
};

const withState = (() => {
	const state = {
		cwd: undefined,
		service: undefined
	};

	const stateFnWrapper = (func) => async (args) => {
		let handler;
		try {
			const handlers = getStatefulHandlers(state, { changeFolder });
			handler = handlers[args.triggerEvent.detail.operation];
			const response = handler.response(args.triggerEvent.detail);
			if(response) return { response };
		} catch(e){}

		const { error, response, service } = await func(args)

		try {
			response.trim() && handler.update(response.trim(), service);
		} catch(e){}

		return { error, response };
	};

	return stateFnWrapper;
})();

async function invokeRaw(args={}, thisCommand){
	const { event, invokeRaw, map: argMapper, comm } = thisCommand || this;
	const { response: cwd } = event[0] !== 'showCurrentFolder'
		? (await invokeRaw.bind({
				event: ['showCurrentFolder'],
				map: argMapper,
				comm
			})())
		: {};
	const argsPlusExtra = { ...args, cwd };
	const mappedArgs = argMapper
		? argMapper(argsPlusExtra)
		: argsPlusExtra;

	if(Object.keys(manualCommands).includes(event[0])){
		let { error, response } = await manualCommands[event[0]](mappedArgs);
		return { error, response };
	}

	let { error, response } = await withState(comm.execute)({
		triggerEvent: {
			type: 'operations',
			detail: {
				source: 'TerminalWIP',
				operation: event[0], //TODO: what if event has more than one item?
				...mappedArgs
			},
		}
	});
	if(response && response.trim){
		response = response.trim();
	}
	return { error, response };
}

async function invoke(args, done){
	this.term.write('\n');
	const { error, response } = await this.invokeRaw(args, this);
	if(error){
		this.term.write(jsonColors({ error })+'\n');
		return done();
	}
	if(response && this.mapResponse){
		this.term.write(this.mapResponse(response));
		return done();
	}
	if(response){
		this.term.write(response + '\n');
	}
	//this.term.write(notImplemented(this));
	done();
};

async function exit(){}

const Operation = (config, term, comm) => ({
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

const GetOps = (term, comm) => {
	const opmap = config => Operation(config, term, comm)
	return commands.map(opmap);
};

export default GetOps;


