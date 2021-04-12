import comm from './terminal.comm.mjs';
import Keys from './terminal.keys.mjs';
import Lib from './terminal.lib.mjs';
import Xterm from './terminal.xterm.mjs';
import GetOps from './terminal.ops.mjs';

import { Watch } from './terminal.watch.mjs';
import { History } from './terminal.history.mjs';
import { Git } from './terminal.git.mjs';

import { chalk } from './terminal.utils.mjs';

const term = Xterm();

//TODO: state
let running = undefined;
let charBuffer = [];
const setBuffer = (str) => { charBuffer = str.split('') };
const getBuffer = () => charBuffer.join('');
const getRunning = () => running;
const setRunning = (target) => running = target;

const history = new History({ chalk, setBuffer, getBuffer });
const ops = [ history, new Watch(term, comm), Git(term, comm), ...GetOps(term, comm)];
const lib = Lib({ term, ops, setBuffer, getBuffer, setRunning, getRunning, comm });

const { bubbleHandler, keyHandler } = Keys({ lib, getBuffer, setBuffer });
term._attachHandlers({ bubbleHandler, keyHandler });

term.write('\n');
//term.focus();
lib.showPrompt();

