//show-preview
import GetDynamicOps from './terminal.ops.dynamic.js'
import {parseArgs} from './terminal.lib.js'

(async () => {
	const term = {
		write: console.log
	};
	const comm = () => {};
	const ops = await GetDynamicOps(term, comm);
	
	const logger = console.log;
	const done = () => console.log('finished');
	
	const thisOp = ops[1];
	const args = parseArgs(thisOp, '-w foo.js')
	thisOp.invoke(args, done);
	thisOp.invoke(args, done)
})();

