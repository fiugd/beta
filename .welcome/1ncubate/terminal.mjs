import comm from './terminal.comm.mjs';
import Keys from './terminal.keys.mjs';
import Lib from './terminal.lib.mjs';
import Xterm from './terminal.xterm.mjs';

const term = Xterm();

//TODO: state
let running = undefined;
let charBuffer = [];
const setBuffer = (str) => { charBuffer = str.split('') };
const getBuffer = () => charBuffer.join('');
const getRunning = () => running;
const setRunning = (target) => running = target;

const lib = Lib({ term, setBuffer, getBuffer, setRunning, getRunning, comm });

const { bubbleHandler, keyHandler } = Keys({ lib, getBuffer, setBuffer });
term._attachHandlers({ bubbleHandler, keyHandler });

term.write('\n');
//term.focus();
lib.prompt(term);

