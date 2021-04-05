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


let charBuffer = [];
const history = [];
let currentCommand = -1;

const onEnter = function (callback) {
	const command = [...history].reverse()[currentCommand] || charBuffer.join("");
	history.push(command);
	currentCommand = -1;
	charBuffer = [];
	if(!callback) term.write("\n");
	callback && callback();
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
	console.log(padding)
	history.forEach((h,i) => term.write(`${chalk.dim((i+1+'').padStart(padding, ' '))}  ${h}\n`))
};
const supportedCommands = {
	cls: clearTerminal,
	clear: clearTerminal,
	history: printHistory,
};

const enterCommand = (e) => {
	const buffer = charBuffer.join("");
	const execute = supportedCommands[buffer];
	onEnter(execute);
};
const backspaceCommand = (e) => {
	if([...history].reverse()[currentCommand]){
		charBuffer = [...history].reverse()[currentCommand].split();
		currentCommand = -1;
	}
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
	BackSpace: backspaceCommand,
};

term.onKey((e) => {
	const printable =
		!e.domEvent.altKey &&
		!e.domEvent.altGraphKey &&
		!e.domEvent.ctrlKey &&
		!e.domEvent.metaKey;
	if(keys[e.domEvent.key])return keys[e.domEvent.key](e);
	if (!printable) return;

	if([...history].reverse()[currentCommand]){
		charBuffer = [...history].reverse()[currentCommand].split();
		currentCommand = -1;
	}
	if (e.key.length === 1) {
		charBuffer.push(e.key);
	}
	term.write(e.key);

});

/*
term.on('paste', function(data) {
	term.write(data);
});
*/

term.onResize(() => {
	fitAddon.fit();
});

// not sure if this is really needed
window.termResize = () => {
	fitAddon.fit();
};

window.addEventListener("resize", function () {
	fitAddon.fit();
});

fitAddon.fit();

term.write('\n');
//term.focus();
prompt(term);
window.term = term;
