const description = "Reset fiug's state";
const args = [];

const operation = async (args) => {
	const { default: localForage } = await import("https://cdn.skypack.dev/localforage");
	console.log('reset editorStore');
	const editorStore = localforage.createInstance({
		name: 'editorState',
		storeName: 'editor',
	});
	editorStore.clear();

	console.log('reset moduleCache');
	localStorage.removeItem('moduleCache');

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
	return '';
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
