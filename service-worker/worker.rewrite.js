
/*
<script type="importmap" src="/importmap.importmap"></script>

const script = document.createElement('script')
script.src = '/importmap.importmap';
script.type = 'importmap';
document.body.appendChild(script);

probably makes more sense to have service worker rewrite imports versus trying to make this work
see fiug-beta/.welcome/1ncubate/sw-worker-rewrite

also, look into https://github.com/GoogleChromeLabs/comlink
this is for communication between workers
*/

import Babel from "https://cdn.skypack.dev/-/@babel/standalone@v7.15.7-1HPSIsmADpc5jJR5wUwi/dist=es2020,mode=imports,min/optimized/@babel/standalone.js";
//import Babel from '@babel/standalone';

import consolePlugin from './worker-rewrite-plugins/console.js';
import importMapPlugin from './worker-rewrite-plugins/importMap.js';
import processExitPlugin from './worker-rewrite-plugins/processExit.js';
import importAssertions from './worker-rewrite-plugins/importAssertions.js';

Babel.registerPlugin('console', consolePlugin);
Babel.registerPlugin('importMap', importMapPlugin);
Babel.registerPlugin('processExit', processExitPlugin);
Babel.registerPlugin('@babel/syntax-import-assertions', importAssertions);

/*
TODO: babelrc, eg.:

// Comments are allowed as opposed to regular JSON files
{
	presets: [
		// Use the preset-env babel plugins
		'@babel/preset-env'
	],
	plugins: [
		// Besides the presets, use this plugin
		'@babel/plugin-proposal-class-properties'
	]
}
*/


const transpile = (content, map, cwd) => {
	try {
		var output = Babel.transform(content, {
			plugins: [
				['importMap', { map, cwd }],
				'console',
				'processExit',
				"@babel/syntax-import-assertions"
			],
			//sourceType: "module"
		});

		const processWrite = `
const processWrite = (...args) => postMessage({ log: args });
self.hooks = [];
`.trim() + '\n\n';
		
		const processExit = '\n\n' + `
setTimeout(async () => {
	await Promise.allSettled(self.hooks);
	queueMicrotask(() => { postMessage({ exit: true }); });
}, 1);
`.trim() + '\n\n';

		return processWrite + output.code + processExit;
	} catch(e){
		return `/*\n${e.message}\n*/\n\n${content}`;
	}
};

async function getHandler(args){
	const { stores, getFile } = this;
	const { path, query } = args;
	const cwd = path.split('/').slice(0,-1).join('/')
	const isJS = x => new RegExp('\.js$').test(x);

	/*
	const getFile = async (filePath, raw) => {
		//TODO: should fetch from github if ###PLACEHOLDER###
		const value = (await stores.changes.getItem(filePath) || {}).value ||
			await stores.files.getItem(filePath);
		if(raw) return value;
		try {
			return JSON5.parse(value);
		} catch(e){}
		return value;
	};
	*/

	const content = await getFile(path)
	if(!isJS(path)) return await getFile(path, '!raw');

	//TODO: get importmap from other places besides the root dir
	const map = await getFile("~/importmap.json");

	return transpile(content, map, cwd);
}

class WorkerRewrite {
	constructor({ storage }){
		this.stores = storage.stores;
		this.getFile = storage.getFile;

		this.handlers = {
			get: getHandler.bind(this)
		};
	}
}

export { transpile, WorkerRewrite };
