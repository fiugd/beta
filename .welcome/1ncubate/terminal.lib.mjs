import { Watch } from './terminal.watch.mjs';
import { History } from './terminal.history.mjs';
import { chalk } from './terminal.utils.mjs';
import {
	PrintWorkingDir, ChangeDir, MakeDir, List, Remove, Move, Touch
} from './terminal.ops.mjs';

import commandLineArgs from 'https://cdn.skypack.dev/command-line-args';
// also consider: https://www.npmjs.com/package/minimist
// https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Shells


const getSupportedCommands = (commands) => {
	const [watch, pwd, cd, md, ls, rm, mv, touch] = commands.ops;
	return {
		cls: commands.clearTerminal,
		clear: commands.clearTerminal,
		history: commands.history.print,

		watch, pwd, cd, md, ls, rm, mv, touch,
		dir: ls,
		mkdir: md,
	};
};

//TODO: use state for this
const SYSTEM_NAME = 'fiug.dev v0.4';
const CURRENT_FOLDER = '.welcome/current';

const parseArgs = (model, argString) => {
	if(!model?.cliArgOptions) return argString;
	const options = {
		argv: argString.trim().split(' '),
		partial: true
	};
	if(typeof model.cliArgOptions === 'function') return model.cliArgOptions(options.argv);

	const result = commandLineArgs(model.cliArgOptions, options);
	return result;
}

export default ({ term, setBuffer, getBuffer, setRunning, getRunning, comm }) => {

	//const writePromptIndicator = () => term.write(chalk.white.bold('∑ '));
	const writePromptIndicator = () => term.write(chalk.white.bold('$ '));
	const writeSysName = () => term.write(chalk.rgb(60, 180, 190)(SYSTEM_NAME));
	const writeCurrentFolder = () => term.write(chalk.hex('#00FF00')(CURRENT_FOLDER));
	const prompt = (term) => {
		writeSysName();
		term.write(' ');
		writeCurrentFolder();
		term.write(' \r\n');
		writePromptIndicator();
	};
	const writeLine = term.write.bind(term);
	const eraseLine = () => term.write('\x1B[2K\r');
	const eraseToPrompt = () => eraseLine() & writePromptIndicator(false/*no new line*/);
	const setLine = (replace) => eraseToPrompt() & term.write(replace);
	const clearTerminal = (e) => eraseLine() & term.clear();
	// TODO: ask if the user meant some other command & provide link to run it
	const unrecognizedCommand = (keyword) => (e) => term.write(`\n${keyword}: command not found\n`)

	const history = new History({ chalk, writeLine, setLine, setBuffer, getBuffer });
	const InstantiateOp = (op) => new op(term, comm);
	const ops = [Watch, PrintWorkingDir, ChangeDir, MakeDir, List, Remove, Move, Touch]
		.map(InstantiateOp);
	const supportedCommands = getSupportedCommands({ clearTerminal, history, ops });

	const enterCommand = (e) => {
		if(getRunning()) return term.write('\n');
		history.updateBuffer();
		const buffer = getBuffer();
		if(!buffer) return prompt(term);

		const [,keyword, args] = new RegExp(`^(.+?)(?:\\s|$)(.*)$`).exec(buffer) || [];
		const command = supportedCommands[keyword] || unrecognizedCommand(keyword);

		const done = () => {
			setRunning(undefined);
			term.write('\n');
			prompt(term);
		};
		
		const handler = !command.invoke
			? command
			: (e) => {
				setRunning(command);
				command.invoke(parseArgs(command, args), done);
			};

		history.push(buffer);
		setBuffer('');
		handler && handler();
		if(command.invoke) return;
		done()
	};

	const backspaceCommand = (e) => {
		history.updateBuffer();

		// Do not delete the prompt
		if (term._core.buffer.x <= 2) return;

		setBuffer(getBuffer().slice(0, -1));
		term.write("\b \b");
	};

	const copyKillCommand = async (e) => {
		try {
			const clip = term.getSelection();
			const running = getRunning();
			if(running && !clip){
				await running.exit();
				setRunning(undefined);
				term.write("\n");
				prompt(term);
				return;
			}
			await navigator.clipboard.writeText((clip+'').trim());
		} catch(e){}
	};

	const pasteCommand = async (e) => {
		try {
			history.updateBuffer();
			const clip = (await navigator.clipboard.readText()).split('\n')[0].trim();
			setBuffer(`${getBuffer()}${clip}`);
			eraseToPrompt();
			term.write(getBuffer());
		} catch(e){}
	};
	
	const selectAll = async (e) => {
		setTimeout(term.selectAll.bind(term), 1);
	};
	
	return {
		clearTerminal, prompt, eraseToPrompt, writeLine, selectAll,
		enterCommand, backspaceCommand, copyKillCommand, pasteCommand,
		history
	}
};
