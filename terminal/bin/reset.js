const description = "Reset fiug's state";
const args = [{
	name: 'editor', type: Boolean, defaultValue: false, alias: 'e', required: false
}, {
	name: 'module', type: Boolean, defaultValue: false, alias: 'm', required: false
}, {
	name: 'repo', type: String, alias: 'r', required: false
}];

/*
	this is a "plain" type script which means
	that operation function runs in the page context
	this does NOT run in a worker
*/

const operation = async (args) => {
	let output;
	const { logger, event } = args;
	const { editor, module, repo } = event;
	//logger('ARGUMENTS:\n\n'+JSON.stringify(rest, null, 2) + '\n\n');

	if(editor){
		const { default: localForage } = await import("https://cdn.skypack.dev/localforage");
		logger('reset editorStore\n');
		const editorStore = localForage.createInstance({
			name: 'editorState',
			storeName: 'editor',
		});
		editorStore.clear();
		output = 'Refresh browser window to complete reset.'
	}

	if(module){
		logger('reset moduleCache\n');
		localStorage.removeItem('moduleCache');
		output = 'Refresh browser window to complete reset.'
	}
	
	if(repo){
		logger(`TODO: reset repo [${repo}]\n`);
	}

	/*
		delete cache storage:
		https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/delete

		TODO:
		cache.terminal-cache
		cache.service worker?

		indexDB.service-worker files?
			- any files that are ##PLACEHOLDER## ?
		indexDB.service-worker handlers?
		indexDB.service-worker changes?
			- opened
			- expanded
			- selected

		indexDB.editorState?

		what about resetting a service/repo?
		
		sessionStorage?

		output a message?
	*/
	return output;
};

export default class Node {
	name = 'Reset';
	keyword = 'reset';
	listenerKeys = [];
	type = 'plain';
	description = description;
	usage = '';
	args = args;

	constructor(){
		this.operation = operation;
		this.help = () => usage;
	}
};
