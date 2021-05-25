//show-preview
(async () => {
	const baseUrl = location.origin+ '/crosshj/fiug-beta/terminal';
	const { default: GetDynamicOps } = await import(`${baseUrl}/terminal.ops.dynamic.js`);
	const { parseArgs } = await import(`${baseUrl}/terminal.lib.js`);

	const term = {
		write: console.log
	};
	const comm = () => {};
	const getCwd = () => 'crosshj/fiug-beta/terminal';
	const ops = await GetDynamicOps(term, comm, getCwd);
	
	const logger = console.log;
	const done = () => console.log('finished');
	
	const thisOp = ops[1];
	const args = parseArgs(thisOp, '.example.js');
	console.log(thisOp)
	await thisOp.invoke(args, done);
	//await thisOp.invoke(args, done);
})();
