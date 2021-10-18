
let allServices;
let currentService;

const dummyFunc = (fnName, returns='') => (...args) => {
	console.log({ ...args, fnName });
	return returns;
};

const getCurrentFile = dummyFunc('getCurrentFile');
const getCurrentFileFull = dummyFunc('getCurrentFileFull', {
	code: '',
	path: '../index.html',
	name: 'index.html',
	id: 1,
	filename: 'index.html',
});
const setCurrentFile = dummyFunc('setCurrentFile');


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

const initState = (all, current) => {
	allServices = all;
	currentService = current;
};

export {
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
};