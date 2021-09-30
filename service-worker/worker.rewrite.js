//import Babel from 'https://cdn.skypack.dev/@babel/standalone';
import Babel from 'https://cdn.skypack.dev/-/@babel/standalone@v7.15.7-1HPSIsmADpc5jJR5wUwi/dist=es2020,mode=imports,min/optimized/@babel/standalone.js';

import consolePlugin from './worker-rewrite-plugins/console.js';
import importMapPlugin from './worker-rewrite-plugins/importMap.js';
import processExitPlugin from './worker-rewrite-plugins/processExit.js';

Babel.registerPlugin('console', consolePlugin);
Babel.registerPlugin('importMap', importMapPlugin);
Babel.registerPlugin('processExit', processExitPlugin);

async function getHandler(args){
	const { stores } = this;
	const { path, query } = args;
	const isJS = x => new RegExp('\.js$').test(x);
	
	const getFile = async (filePath) => {
		const value = (await stores.changes.getItem(filePath) || {}).value ||
			await stores.files.getItem(filePath);
		try {
			return JSON.parse(value);
		} catch(e){}
		return value;
	};

	const content = await getFile(path)
	if(!isJS(path)) return content;

	//TODO: get importmap from other places besides the root dir
	const map = await getFile("~/importmap.json");

	try {
		var output = Babel.transform(content, {
			plugins: [
				['importMap', { map }],
				'console',
				//'processExit'
			],
			//sourceType: "module"
		});

		const processWrite = `
			const processWrite = (...args) => postMessage({ log: args });
		`.trim() + '\n\n';

		return processWrite + output.code;
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
