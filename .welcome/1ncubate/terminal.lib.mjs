import { Watch } from './terminal.watch.mjs';
import { History } from './terminal.history.mjs';

import chalk from 'https://cdn.skypack.dev/chalk';
// enable browser support for chalk
(() => {
	const levels = {
		disabled: 0,
		basic16: 1,
		more256: 2,
		trueColor: 3
	}
	chalk.enabled = true
	chalk.level = levels.trueColor;
})()

//TODO: use state for this
const SYSTEM_NAME = 'fiug.dev v0.4';
const CURRENT_FOLDER = '.welcome/current';

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

	const history = new History({ chalk, writeLine, setLine, setBuffer, getBuffer });
	const watch = new Watch(term, comm);
	const watchCommand = (args) => (e) => {
		setRunning(watch);
		watch.invoke(args);
	};

	const supportedCommands = {
		cls: clearTerminal,
		clear: clearTerminal,
		history: history.print
	};
	
	const onEnter = function (callback, noExit) {
		const command = history.currentItem || getBuffer();
		history.push(command);
		setBuffer('');
		if(!callback) term.write("\n");
		callback && callback();
		if(noExit) return;
		term.write("\n");
		prompt(term);
	};

	const enterCommand = (e) => {
		if(getRunning()) return term.write('\n');
		history.updateBuffer();
		const buffer = getBuffer();
		const watchArgs = (new RegExp('^watch(.*)').exec(buffer)||[])[1]
		if(watchArgs) return onEnter(watchCommand(watchArgs), 'noExit');
		const execute = supportedCommands[buffer];
		onEnter(execute);
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
		history, watch
	}
};
