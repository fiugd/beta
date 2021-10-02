import Babel from '@babel/standalone';
import babelPluginSyntaxImportAssertions from '@babel/syntax-import-assertions';

import consolePlugin from './worker-rewrite-plugins/console.js';
import importMapPlugin from './worker-rewrite-plugins/importMap.js';
import processExitPlugin from './worker-rewrite-plugins/processExit.js';

Babel.registerPlugin('console', consolePlugin);
Babel.registerPlugin('importMap', importMapPlugin);
Babel.registerPlugin('processExit', processExitPlugin);
Babel.registerPlugin('@babel/syntax-import-assertions', babelPluginSyntaxImportAssertions);

const transpile = (content, map) => {
	try {
		var output = Babel.transform(content, {
			plugins: [
				['importMap', { map }],
				'console',
				'processExit',
				"@babel/syntax-import-assertions",
			],
			//sourceType: "module"
		});

		const processWrite = `
			const processWrite = (...args) => postMessage({ log: args });
			self.asyncHooks = [];
			self.hookCount = 0;
		`.trim() + '\n\n';
		
		const processExit = '\n\n' + `
			//queueMicrotask(() => {
			//	postMessage({ exit: true });
			//});
			setTimeout(async () => {
				//console.log(self.asyncHooks.length);
				await Promise.allSettled(self.asyncHooks);
				//console.log(self.asyncHooks.length);
				queueMicrotask(() => {
					postMessage({ exit: true });
				});
			}, 1);
		`.trim() + '\n\n';

		return processWrite + output.code + processExit;
	} catch(e){
		return `/*\n${e.message}\n*/\n\n${content}`;
	}
};

async function getHandler(args){
	const { stores } = this;
	const { path, query } = args;
	const isJS = x => new RegExp('\.js$').test(x);
	
	const getFile = async (filePath) => {
		const value = (await stores.changes.getItem(filePath) || {}).value ||
			await stores.files.getItem(filePath);
		try {
			return JSON5.parse(value);
		} catch(e){}
		return value;
	};

	const content = await getFile(path)
	if(!isJS(path)) return content;

	//TODO: get importmap from other places besides the root dir
	const map = await getFile("~/importmap.json");

	return transpile(content, map);
}

class WorkerRewrite {
	constructor({ storage }){
		this.stores = storage.stores;

		this.handlers = {
			get: getHandler.bind(this)
		};
	}
}

export { transpile, WorkerRewrite };
