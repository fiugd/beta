//2021-02-26 14:59

import { isString } from "./Types.mjs";
import { attach, attachTrigger } from "./Listeners.mjs";
import ext from "/shared/icons/seti/ext.json.mjs";

const SYSTEM_NAME = `fiug.dev v0.4`;

const execTrigger = attachTrigger({
	name: "State",
	eventName: "operations",
	type: "raw",
});

let listenerQueue = [];

let currentService;
let currentFile;
let currentFilePath;

let currentFolder;
let allServices;

const state = {
	changedFiles: {},
	openedFiles: {},
};

const sortAlg = (propFn = (x) => x, alg = "alpha") => {
	if (alg === "alpha") {
		const lowSafe = (x = "") => x.toLowerCase();
		return (a, b) => {
			const afilename =
				lowSafe(propFn(a)).split(".").slice(0, -1).join(".") ||
				lowSafe(propFn(a));
			const bfilename =
				lowSafe(propFn(b)).split(".").slice(0, -1).join(".") ||
				lowSafe(propFn(b));
			if (afilename < bfilename) {
				return -1;
			}
			if (afilename > bfilename) {
				return 1;
			}
			const aExt = lowSafe(propFn(a)).replace(afilename, "");
			const bExt = lowSafe(propFn(b)).replace(bfilename, "");
			if (aExt < bExt) {
				return -1;
			}
			if (aExt > bExt) {
				return 1;
			}
			return (a, b) => propFn(a) - propFn(b);
		};
	}
	console.log(`sort algorithm not found: ${alg}`);
};

function getFileType(fileName = "") {
	let type = "default";
	const extension = ((fileName.match(/\.[0-9a-z]+$/i) || [])[0] || "").replace(
		/^\./,
		""
	);

	//console.log(extension)
	if (ext[extension]) {
		type = ext[extension];
	}
	if (extension === "md") {
		type = "info";
	}
	return type;
}

const flattenTree = (tree, folderPaths) => {
	const results = [];
	const recurse = (branch, parent = "/") => {
		const leaves = Object.keys(branch);
		leaves.map((key) => {
			const children = Object.keys(branch[key]);
			if (!children || !children.length) {
				results.push({
					name: key,
					code: parent + key,
					path: parent + key,
				});
			} else {
				if (folderPaths) {
					results.push({
						name: key,
						path: parent + key,
					});
				}
				recurse(branch[key], `${parent}${key}/`);
			}
		});
	};
	recurse(tree);
	return results;
};

function getDefaultFile(service) {
	let defaultFile;
	try {
		const manifestJson = JSON.parse(
			service.code.find((x) => x.name === "service.manifest.json").code
		);
		defaultFile = manifestJson.main;
	} catch (e) {}
	try {
		const packageJson = JSON.parse(
			service.code.find((x) => x.name === "package.json").code
		);
		defaultFile = packageJson.main;
	} catch (e) {}
	return defaultFile || "index.js";
}

const getCurrentServiceTree = ({ flat, folders } = {}) => {
	return flat
		? flattenTree(currentService.tree, folders)
				.map(({ name, path } = {}) => ({
					name,
					path,
					relativePath: path.split(currentService.name).slice(1).join(''),
					type: getFileType(name)
				}))
				.sort(sortAlg((x) => x.name))
		: currentService.tree;
};

// has side effects of setting current code
const getCurrentService = ({ pure } = {}) => {
	if (pure) {
		//if (!currentService?.code) debugger;
		return currentService;
	}
	const changedArray = Object.keys(state.changedFiles).map(
		(k) => state.changedFiles[k]
	);
	const mostRecent = changedArray.map((x) => x[x.length - 1]);

	//error here because currentService is wrong sometimes

	// SIDE EFFECTS!!!
	mostRecent.forEach((m) => {
		const found = currentService.code.find((x) => {
			x.path === `/${currentService.name}/${m.filename}` ||
			x.name === m.filename
		});
		if (!found) {
			console.error({
				changedArray,
				mostRecent,
				filename: m.filename,
				found: found || "notfound",
			});
			return;
		}
		found.code = m.code;
	});

	return currentService;
};

// has side-effects of setting currentService and currentFile

// this should really be broken out into:
//    setCurrentFile, setCurrentService
//    getCurrentFile, getCurrentService

function setCurrentFile({ filePath, fileName }){
	if(filePath){
		currentFile = filePath.split('/').pop();
		//currentFilePath = `/${currentService.name}/${filePath}`;
		currentFilePath = filePath;
		return;
	}
	currentFile = fileName;
	currentFilePath = undefined;
}

function getCurrentFile(){
	return currentFilePath || currentFile;
}
async function getCurrentFileFull(){
	const fileBody = currentFilePath
		? currentService.code.find((x) => x.path === currentFilePath)
		: currentService.code.find((x) => x.name === currentFile);

	if(fileBody && fileBody.path){
		fileBody.code = await (await fetch(fileBody.path)).text();
	}

	return fileBody;
}

function setCurrentService(service) {
	return getCodeFromService(service);
}

function getCodeFromService(service, file) {
	const serviceAction = !!service ? "set" : "get";
	const fileAction = !!file ? "set" : "get";

	if (
		serviceAction === "set" &&
		currentService &&
		Number(currentService.id) !== Number(service.id)
	) {
		resetState();
	}

	if (serviceAction === "set") {
		currentService = service;
	}

	if (serviceAction === "get") {
		//this caues service files based on changedArray
		getCurrentService();
	}

	if (fileAction === "set") {
		currentFile = file;
	}

	if (fileAction === "get") {
		currentFile = currentFile || getDefaultFile(currentService);
	}

	const code = Array.isArray(currentService.code)
		? (currentService.code.find((x) => x.name === currentFile) || {}).code || ""
		: isString(() => currentService.code)
		? currentService.code
		: "";

	return {
		name: currentService.name,
		id: currentService.id,
		// may be able to make next two lines go away (and also other code and file related stuff
		code,
		filename: currentFile,
	};
}

function getState({ folderPaths, serviceRelative } = {}) {
	//TODO: should probably pull only latest state change
	let paths;
	try {
		const tree = serviceRelative
			? currentService.tree[currentService.name]
			: currentService.tree;
		paths = flattenTree(tree, folderPaths);
	} catch (e) {}
	return JSON.parse(JSON.stringify({ ...state, paths }));
}

function setState(change) {
	//TODO: this could be expensive
	const { name, id, code, prevCode, filename } = change;
	//console.log(change);
	const stateKey = `${id}|${name}|${filename}`;

/*
	if (!state.changedFiles[stateKey]) {
		state.changedFiles[stateKey] = [
			{
				name,
				id,
				code: prevCode,
			},
		];
	}
	state.changedFiles[stateKey].push({ name, id, code, filename });
*/
	openFile({ name: filename });
	return currentFile;
}

const getCurrentFolder = () => currentFolder;
const setCurrentFolder = (path) => {
	currentFolder = path;
};

const resetState = () => {
	//console.log(`Current Service reset!`);
	currentFile = currentService = null;
	state.changedFiles = {};
};

async function getAllServices() {
	const queueListener = () =>
		new Promise((resolve, reject) => {
			const commandQueueId = Math.random().toString().replace("0.", "");
			listenerQueue.push({
				id: commandQueueId,
				after: ({ result = {} } = {}) => {
					allServices = result.result || allServices || [];
					resolve(allServices);
				},
			});
			execTrigger({
				detail: {
					operation: "read",
					listener: commandQueueId,
					body: {
						id: "*",
					},
				},
			});
		});
	return await queueListener();
}

function openFile({ name, parent, ...other }) {
	const fullName = parent
		? `${parent}/${name}`
		: name;
	const SOME_BIG_NUMBER = Math.floor(Number.MAX_SAFE_INTEGER/1.1);
	Object.entries(state.openedFiles)
		.forEach(([k,v]) => {
			v.selected = false;
		});
	state.openedFiles[fullName] = {
		name: fullName,
		...other,
		selected: true,
		order: SOME_BIG_NUMBER,
	};
	//NOTE: well-intentioned, but not currently working right
	//currentFile = fullName;
	Object.entries(state.openedFiles)
		.sort(([ka,a],[kb,b]) => a.order - b.order)
		.forEach(([k,v], i) => {
			v.order = i;
		});
}

function closeFile({ name, path, next, nextPath }) {
	const fullName = parent
		? `${parent}/${name}`
		: name;
	const nextFullName = nextPath
		? `${nextPath}/${next}`
		: next;
	const objEntries = Object.entries(state.openedFiles)
		.map(([key, value]) => value)
		.filter((x) => x.name !== fullName)
		.sort((a, b) => a.order - b.order)
		.map((x, i) => {
			const selected = x.name === nextFullName;
			return { ...x, order: i, selected };
		})
		.map((x) => {
			const fullName = x.parent
				? `${x.parent}/${x.name}`
				: x.name;
			return [fullName, x]
		});
	state.openedFiles = Object.fromEntries(objEntries);
}

function moveFile({ name, order }) {
	state.openedFiles[name].order = order;
}

function getOpenedFiles() {
	return Object.entries(state.openedFiles)
		.map(([key, value]) => value)
		.sort((a, b) => a.order - b.order)
		.map((x, i) => {
			return { ...x, ...{ order: i } };
		});
}

function getSettings(){
	const storedSettings = JSON.parse(localStorage.getItem('editorSettings')||'{}');
	return {
		SYSTEM_NAME,
		tabSize: 2,
		indentWithTabs: true,
		...storedSettings
	}
}

const operationDoneHandler = (event) => {
	if (listenerQueue.length === 0) {
		//console.warn('nothing listening!');
		return;
	}
	const { detail } = event;
	const { op, id, result, operation, listener } = detail;

	const foundQueueItem =
		listener && listenerQueue.find((x) => x.id === listener);
	if (!foundQueueItem) {
		//console.warn(`nothing listening for ${listener}`);
		return false;
	}
	listenerQueue = listenerQueue.filter((x) => x.id !== listener);
	foundQueueItem.after && foundQueueItem.after({ result: { result } });
	return true;
};
const events = [{
	eventName: "operationDone",
	listener: operationDoneHandler,
}, {
	eventName: "fileClose",
	listener: (event) => closeFile(event.detail),
}, {
	eventName: "fileSelect",
	listener: (event) => openFile(event.detail),
}, {
	eventName: "open-settings-view",
	listener: (event) => openFile({
		name: "system::open-settings-view"
	})
}];
events.map((args) =>
	attach({ name: 'State', ...args })
);

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
