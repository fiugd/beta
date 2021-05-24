//show-preview
import GetDynamicOps from './terminal.ops.dynamic.js'
import {parseArgs} from './terminal.lib.js'

(async () => {
	const term = {
		write: console.log
	};
	const comm = () => {};
	const ops = await GetDynamicOps(term, comm);
	
	// const args = {
	// 	"_unknown":["-w"],
	// 	file: "foo.js"
	// };
	const logger = console.log;
	const done = () => console.log('finished');
	
	const thisOp = ops[1];
	console.log({ argModel: (await thisOp.module).args, thisOp })
	const args = parseArgs(thisOp, 'foo.js')
	console.log({ args })
	console.log(await thisOp.invoke(args, logger, done));
})();
