//import Babel from 'https://cdn.skypack.dev/@babel/standalone';
import Babel from 'https://cdn.skypack.dev/-/@babel/standalone@v7.15.7-1HPSIsmADpc5jJR5wUwi/dist=es2020,mode=imports,min/optimized/@babel/standalone.js';

async function getHandler(args){
	const { stores } = this;
	const { path, query } = args;

	let content;
	try {
		content = await stores.files.getItem(path);
		var output = Babel.transform(content, {
			//plugins: ['importMap', 'console', 'processExit'],
			//sourceType: "module"
		});

		return output.code;

		// return JSON.stringify({
		// 	stores: Object.keys(stores),
		// 	path, query, output
		// }, null, 2);
	} catch(e){
		return `${e.message}\n${content}`;
	}
}

class WorkerRewrite {
	constructor({ storage }){
		this.stores = storage.stores;

		this.handlers = {
			get: getHandler.bind(this)
		};
	}
}

export { WorkerRewrite };
