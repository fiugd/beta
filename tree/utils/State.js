import "https://unpkg.com/localforage@latest/dist/localforage.nopromises.min.js";

const changesStore = localforage.createInstance({
	name: "service-worker",
	version: 1.0,
	storeName: "changes",
	description: "keep track of changes not pushed to provider",
});

const DEBUG = false;

let allServices;
let currentService;
let clientId;

const state = {};
const getState = (key) => {
	if(key) return state[key];
	return state;
}
const setState = (key, value) => {
	if(key === 'currentService'){
		currentService = value;
	}
	state[key] = value;
};

// -----------------

const dummyFunc = (fnName, returns='') => (...args) => {
	DEBUG && console.log({ ...args, fnName });
	return returns;
};

const getCurrentFile = dummyFunc('getCurrentFile');
const getCurrentFileFull = () => currentService.state.selected;
const setCurrentFile = ({ filePath }) => {
	const found = currentService.code
		.find(x => x.name === filePath ||
			x.path === '/'+filePath ||
			x.path === '/'+currentService.name+'/'+filePath
		)
	if(found){;
		currentService.state.selected = found;
		currentService.state.selected.filename = found.name;
		return;
	}
	console.error(`could not find ${filePath}`)
};


const getAllServices = () => allServices;
const getCodeFromService = dummyFunc('getCodeFromService');

const getCurrentService = () => currentService;
const getCurrentServiceTree = dummyFunc('getCurrentServiceTree');
const getDefaultFile = dummyFunc('getDefaultFile');
const setCurrentService = dummyFunc('setCurrentService', {
	name: 'crosshj/fake'
});
const getCurrentFolder = dummyFunc('getCurrentFolder');
const setCurrentFolder = dummyFunc('setCurrentFolder');


const resetState = dummyFunc('resetState');

const getSettings = dummyFunc('getSettings', { indentWithTabs: true, tabSize: 2 });
const openFile = dummyFunc('openFile');
const closeFile = dummyFunc('closeFile');
const moveFile = dummyFunc('moveFile');
const getOpenedFiles = dummyFunc('getOpenedFiles');

const initState = (all, current) => {
	allServices = all;

	currentService = current;

	// TODO: this is UGLY - service worker should be consistent with how it returns files...
	currentService.code.forEach(x => {
		if(x.path.startsWith('/')) return;
		x.path = '/' + x.path;
	});
	if(typeof currentService.state.selected === "string" && currentService.state.selected){
		setCurrentFile({
			filePath: `${currentService.name}/${currentService.state.selected}`
		});
	}
};

const createClientId = () => Math.random()
	.toString(36)
	.slice(2)
	.toUpperCase()
	.split(/(.{4})/)
	.filter(x=>x)
	.join('_');

const getClientId = () => {
	if(clientId) return clientId;
	clientId = createClientId();
	return clientId;
};

/*
TODO: this should leverage service worker instead
should also probably be handled with a listener
*/
const treeMemory = {
	expand: async (expanded) => {
		try {
			const oldExpanded = (await changesStore.getItem(`tree-${currentService.name}-expanded`)) || [];
			const newExpanded = oldExpanded.includes(expanded)
				? oldExpanded
				: [...oldExpanded, expanded];
			await changesStore.setItem(`tree-${currentService.name}-expanded`, newExpanded);
		} catch(e) { debugger; }
	},
	collapse: async (collapsed) => {
		try {
			const oldExpanded = (await changesStore.getItem(`tree-${currentService.name}-expanded`)) || [];
			const newExpanded = oldExpanded.filter(x => x !== collapsed);
			await changesStore.setItem(`tree-${currentService.name}-expanded`, newExpanded);
		} catch(e) { debugger; }
	},
	select: async (selected) => {
		try {
			await changesStore.setItem(`tree-${currentService.name}-selected`, selected);
		} catch(e) { debugger; }
	}
};

export {
	DEBUG,

	initState,
	getAllServices,
	getCodeFromService,

	getCurrentFile,
	getCurrentFileFull,
	setCurrentFile,

	getCurrentService,
	getCurrentServiceTree,
	getDefaultFile,
	setCurrentService,
	getCurrentFolder,
	setCurrentFolder,
	getState,
	setState,
	resetState,
	getSettings,
	openFile,
	closeFile,
	moveFile,
	getOpenedFiles,

	getClientId,
	treeMemory,
};