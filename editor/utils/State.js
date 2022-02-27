const DEBUG = false;

let allServices;
let currentService;
let clientId;

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

const getState = dummyFunc('getState');
const setState = dummyFunc('setState');
const resetState = dummyFunc('resetState');

const getSettings = dummyFunc('getSettings', { indentWithTabs: true, tabSize: 2 });
const openFile = dummyFunc('openFile');
const closeFile = dummyFunc('closeFile');
const moveFile = dummyFunc('moveFile');
const getOpenedFiles = dummyFunc('getOpenedFiles');

const urlParams = new URLSearchParams(window.location.search);

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

	const fileParam = urlPrams.get('file');
	if(fileParam){
		currentService.state = {
			singleFileMode: true,
			opened: [{ name: fileParam, order:0 }],
			selected: fileParam,
			changed: currentService.state.changed.includes(fileParam)
				? [currentService.state]
				: []
		}
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
};