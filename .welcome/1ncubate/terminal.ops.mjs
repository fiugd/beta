import { chalk, jsonColors } from './terminal.utils.mjs';
const link = url => chalk.hex('#9cdcfe')(url)

const commands = [
	{
		name: 'PrintWorkingDir',
		keyword: "pwd",
		event: "showCurrentFolder",
		args: [],
	},
	{
		name: 'ChangeDir',
		keyword: "cd",
		event: "changeCurrentFolder",
		args: [
			{ name: 'path', type: String, defaultOption: true }
		],
	},
	{
		name: 'MakeDir',
		keyword: "md",
		event: "addFolder",
		args: [
			{ name: 'path', type: String, defaultOption: true }
		],
	},
	{
		name: 'List',
		keyword: "ls",
		event: "readFolder",
		args: [
			{ name: 'path', type: String, defaultOption: true }
		],
	},
	{
		name: 'Remove',
		keyword: "rm",
		event: ["deleteFile", "deleteFolder"],
		args: [
			{ name: 'path', type: String, defaultOption: true }
		],
	},
	{
		name: 'Move',
		keyword: "mv",
		event: ["moveFile", "moveFolder"],
		args: ([ target, destination ]) => ({ target, destination }),
	},
	{
		name: 'Touch',
		keyword: "touch",
		event: "addFile",
		args: [
			{ name: 'path', type: String, defaultOption: true }
		],
	},
];

async function invoke(args, done){
	this.term.write('\n');
	this.term.write(jsonColors(args));
	this.term.write(this.usage);
	done();
};
async function exit(){}

const ConstructClass = (config) => {
	const thisFunc = function (term, Communicate){
			this.term = term;
			this.comm = Communicate;
			this.invoke = invoke.bind(this);
			this.exit = exit.bind(this)
	};
	thisFunc.prototype.event = Array.isArray(config.event) ? config.event : [config.event];
	thisFunc.prototype.keyword = config.keyword;
	thisFunc.prototype.listenerKeys = [];
	thisFunc.prototype.term = undefined;
	thisFunc.prototype.cliArgOptions = config.args;
	thisFunc.prototype.usage = chalk.hex('#ccc')(
		`\n${config.keyword}: not implemented\n`
	);

	return thisFunc;
};

const ConstructObject = (all, one) => {
	all[one.name] = ConstructClass(one);
	return all;
};

const {
	PrintWorkingDir, ChangeDir, MakeDir, List, Remove, Move, Touch
} = commands.reduce(ConstructObject, {});

export { PrintWorkingDir, ChangeDir, MakeDir, List, Remove, Move, Touch };
