//show-preview

/*

I'm thinking there may be a way to guess if script is not active in worker - will try that

*/

/*
import GetDynamicOps from './terminal.ops.dynamic.js';
import {parseArgs} from './terminal.lib.js';

const term = {
	write: console.log
};
const comm = () => {};
const getCwd = () => 'crosshj/fiug-beta/terminal';
const logger = console.log;
const done = () => console.log('finished');

GetDynamicOps(term, comm, getCwd)
	.then(ops => {
		const thisOp = ops[1];
		const args = parseArgs(thisOp, '.example.js');
		console.log(thisOp)
		thisOp.invoke(args, done);
	});
*/
import comm from './terminal.comm.js';

document.body.innerHTML += `
	<style>#f{ margin: 4em 2em; color: #777; font: 20px sans-serif;}</style>
	<div id="f">see dev tools terminal output...</div>
`;

(async () => {
	const baseUrl = location.origin+ '/crosshj/fiug-beta/terminal';
	const { default: GetDynamicOps } = await import(`${baseUrl}/terminal.ops.dynamic.js`);
	const { parseArgs } = await import(`${baseUrl}/terminal.lib.js`);

	const term = {
		write: console.log
	};

	const getCwd = () => 'crosshj/fiug-beta/terminal';
	const ops = await GetDynamicOps(term, comm, getCwd);
	
	const logger = console.log;
	const done = () => console.log('finished');
	
	const thisOp = ops.find(x=>x.keyword==="node");
	const args = parseArgs(thisOp, '--watch .example.js'); 

	await thisOp.invoke(args, done); 
})();
