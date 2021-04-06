import { Watch } from './terminal.watch.mjs';
import chalk from 'https://cdn.skypack.dev/chalk';
const SYSTEM_NAME = 'fiug.dev v0.4';
const CURRENT_FOLDER = '.welcome/current';

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

const alotOfEvents = [
	'ui', 'fileClose', 'fileSelect', 'operations', 'operationDone',
];

let running = undefined;
let charBuffer = [];
const history = [
	'watch -e fileSelect',
	`watch -e ${alotOfEvents.join(' ')}`,
];
let currentCommand = -1;

const onEnter = function (callback, noExit) {
	const command = [...history].reverse()[currentCommand] || charBuffer.join("");
	history.push(command);
	currentCommand = -1;
	charBuffer = [];
	if(!callback) term.write("\n");
	callback && callback();
	if(noExit) return;
	term.write("\n");
	prompt(term);
};

const options = {
	theme: {
		background: "rgba(255, 255, 255, 0.0)", // '#1e1e1e',
		//fontFamily: 'consolas'
	},
	allowTransparency: true,
	fontSize: 13,
	//fontWeight: 100,
	convertEol: true,
	//rendererType: 'dom',
};

const term = new Terminal(options);

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);

term.open(document.querySelector('#terminal .term-contain'));

//const writePromptIndicator = () => term.write(chalk.white.bold('∑ '));
const writePromptIndicator = () => term.write(chalk.white.bold('$ '));
const prompt = (term) => {
	term.write(`${chalk.rgb(60, 180, 190)(SYSTEM_NAME)} ${chalk.hex('#00FF00')(CURRENT_FOLDER)}`);
	term.write(' \r\n');
	writePromptIndicator();
};
const eraseLine = () => term.write('\x1B[2K\r');
const eraseToPrompt = () => {
	eraseLine();
	writePromptIndicator(false/*no new line*/);
};
const replaceCurrentLine = (replace) => {
	eraseToPrompt();
	term.write(replace);
};
const safeHistoryToBuffer = () => {
	if(![...history].reverse()[currentCommand]) return;
	charBuffer = [...history].reverse()[currentCommand].split('');
	currentCommand = -1;
};

term.attachCustomKeyEventHandler((event) => {
	const F5 = 116;
	const F11 = 122;
	const keysToBubbleUp = [F5, F11];
	return !keysToBubbleUp.includes(event.which || event.keyCode);
});

const prevCommand = (e) => {
	if(currentCommand === history.length -1){
		return;
	}
	currentCommand++;
	replaceCurrentLine([...history].reverse()[currentCommand]);
};
const nextCommand = (e) => {
	if(currentCommand < 0) return
	currentCommand--;
	if(currentCommand === -1){
		replaceCurrentLine(charBuffer.join(""));
		return;
	}
	replaceCurrentLine([...history].reverse()[currentCommand]);
};

const clearTerminal = (e) => {
	eraseLine();
	term.clear();
};
const printHistory = (e) => {
	term.write('\n');
	const padding = Math.floor(history.length/10)+3;
	history.slice(1,-1)
		.forEach((h,i) => {
			term.write(`${chalk.dim((i+1+'').padStart(padding, ' '))}  ${h}\n`)
		})
};

const watch = new Watch(term);
const watchCommand = (args) => (e) => {
	running = watch;
	watch.invoke(args);
};

const supportedCommands = {
	cls: clearTerminal,
	clear: clearTerminal,
	history: printHistory
};

const enterCommand = (e) => {
	safeHistoryToBuffer();
	const buffer = charBuffer.join("");
	const watchArgs = (new RegExp('^watch(.*)').exec(buffer)||[])[1]
	if(watchArgs){
		return onEnter(watchCommand(watchArgs), 'noExit')
	}
	const execute = supportedCommands[buffer];
	onEnter(execute);
};
const backspaceCommand = (e) => {
	safeHistoryToBuffer();

	// Do not delete the prompt
	if (term._core.buffer.x > 2) {
		charBuffer.pop();
		term.write("\b \b");
	}
};
const keys = {
	ArrowUp: prevCommand,
	ArrowDown: nextCommand,
	Enter: enterCommand,
	Backspace: backspaceCommand,
};

const copyKillCommand = async (e) => {
	try {
		if(running){
			await running.exit();
			running = undefined;
			term.write("\n");
			prompt(term);
			return;
		}
		const clip = term.getSelection();
		await navigator.clipboard.writeText(clip);
	} catch(e){}
};
const pasteCommand = async (e) => {
	try {
		safeHistoryToBuffer();
		const clip = (await navigator.clipboard.readText()).split('\n')[0].trim();
		charBuffer = `${charBuffer.join('')}${clip}`.split();
		eraseToPrompt()
		term.write(charBuffer.join(''));
	} catch(e){}
};

const controlKeys = {
	c: copyKillCommand,
	v: pasteCommand,
};

term.onKey((e) => {
	const key = e.domEvent.key;
	const termKey = e.key;

	const modBitmask = [
		e.domEvent.altKey || 0,
		e.domEvent.altGraphKey || 0,
		e.domEvent.metaKey || 0,
		e.domEvent.ctrlKey || 0,
	].map(Number).join('');

	const mods = {
		onlyControl: modBitmask === '0001',
		printable: modBitmask === '0000',
	};

	if(mods.onlyControl && controlKeys[key]){
		return controlKeys[key](e);
	}

	if(keys[key]) return keys[key](e);

	if (!mods.printable) return;

	safeHistoryToBuffer();

	if (termKey.length === 1) {
		charBuffer.push(termKey);
	}
	term.write(termKey);

});

const fitHandler = fitAddon.fit.bind(fitAddon);
term.onResize(fitHandler);
window.termResize = fitHandler;
window.addEventListener("resize", fitHandler);
fitAddon.fit();

term.write('\n');
//term.focus();
prompt(term);
window.term = term;
