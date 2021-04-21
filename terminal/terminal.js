import comm from './terminal.comm.js';
import { Git } from './terminal.git.js';
import { History } from './terminal.history.js';
import Keys from './terminal.keys.js';
import Lib from './terminal.lib.js';
import GetOps from './terminal.ops.js';
import { chalk } from './terminal.utils.js';
import { Watch } from './terminal.watch.js';
import Xterm from './terminal.xterm.js';

const term = Xterm();

//TODO: state
let running = undefined;
let charBuffer = [];
const setBuffer = (str) => { charBuffer = str.split('') };
const getBuffer = () => charBuffer.join('');
const getRunning = () => running;
const setRunning = (target) => running = target;

const history = new History({ chalk, setBuffer, getBuffer });
const ops = [
	...GetOps(term, comm),
	history, new Watch(term, comm), Git(term, comm),
];
const lib = Lib({ term, ops, setBuffer, getBuffer, setRunning, getRunning, comm });

const { bubbleHandler, keyHandler } = Keys({ lib, getBuffer, setBuffer });
term._attachHandlers({ bubbleHandler, keyHandler });

term.write('\n');
//term.focus();
lib.showPrompt();