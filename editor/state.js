
const dummyFunc = (fnName, returns='') => (...args) => {
	console.log({ ...args, fnName });
	return returns;
};

const getAllServices = dummyFunc('getAllServices');
const getCodeFromService = dummyFunc('getCodeFromService');

const getCurrentFile = dummyFunc('getCurrentFile');
const getCurrentFileFull = dummyFunc('getCurrentFileFull');
const setCurrentFile = dummyFunc('setCurrentFile');

const getCurrentService = dummyFunc('getCurrentService');
const getCurrentServiceTree = dummyFunc('getCurrentServiceTree');
const getDefaultFile = dummyFunc('getDefaultFile');
const setCurrentService = dummyFunc('setCurrentService', {
	name: 'crosshj/fiug-beta'
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

export {
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