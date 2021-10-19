import { attach, attachTrigger } from "./Listeners.js";
import {
	getCurrentFile,
	getCurrentService,
} from "./state.js";

import operationDoneHandler from './handlers/editor/operationDone.js';
import fileSelectHandler from './handlers/editor/fileSelect.js';
import {
	getFilePath as gfp, noFrontSlash, pathNoServiceName
} from './utils/misc.js'
const getFilePath = gfp(getCurrentService);


const triggers = {
	ui: attachTrigger({
		name: "Editor",
		eventName: "ui",
		type: "raw",
	}),
};

function triggerEvent(type, operation) {
	triggers[type]({
		detail: {
			operation,
			done: () => {},
			body: {},
		},
	});
};

const contextMenuHandler = ({ showMenu } = {}) => (e) => {
	const editorDom = document.querySelector("#editor .CodeMirror");
	if (!editorDom) {
		return true;
	}
	if (!editorDom.contains(e.target)) {
		return true;
	}
	e.preventDefault();

	const listItems = [
		//"Change All Occurences",
		//"Format Selection",
		//"Format Document",
		//"seperator",
		"Cut",
		"Copy",
		"Paste",
		"seperator",
		"Command Palette",
	].map((x) => (x === "seperator" ? "seperator" : { name: x, disabled: false }));
	let data;
	try {
		data = {};
	} catch (e) {}

	if (!data) {
		console.error("some issue finding data for this context click!");
		return;
	}

	showMenu()({
		x: e.clientX,
		y: e.clientY,
		list: listItems,
		parent: "Editor",
		data,
	});
	return false;
};

const contextMenuSelectHandler = ({ paste, cutSelected, copySelected } = {}) => (e) => {
	const { which, parent, data } = e.detail || {};
	if (parent !== "Editor") {
		//console.log('Editor ignored a context-select event');
		return;
	}
	const contextCommands = {
		"Cut": cutSelected,
		"Copy": copySelected,
		"Paste": paste,
		"Command Palette": () => triggerEvent("ui", "commandPalette")
	};
	const handler = contextCommands[which];
	if(!handler) return console.error(`Unrecognized context menu command: ${which}`);
	handler({ parent, data });
};

const serviceSwitchListener = ({ switchEditor }) => async (event) => {
	const fileName = getCurrentFile();
	//sessionStorage.setItem("editorFile", fileName);
	const currentService = getCurrentService({ pure: true });
	const fileBody = currentService.code.find((x) => x.name === fileName);
	if (!fileBody) {
		console.error(
			`[editor:serviceSwitch] Current service (${currentService.id}:${currentService.name}) does not contain file: ${fileName}`
		);
		switchEditor(null, "nothingOpen");
		return;
	}
	switchEditor(fileName, null, fileBody.code);
};

function attachListener({ switchEditor, messageEditor, paste, cutSelected, copySelected }) {
	const operationDone = operationDoneHandler({ switchEditor, messageEditor });
	const serviceSwitch = serviceSwitchListener({ switchEditor });
	const fileSelect = fileSelectHandler({ switchEditor });
	const contextMenu = contextMenuHandler({ showMenu: () => window.showMenu });
	const contextMenuSelect = contextMenuSelectHandler({ paste, cutSelected, copySelected })

	const listener = async function (e) {

		if (e.type === "operationDone") return operationDone(e);
		if (e.type === "service-switch-notify") return serviceSwitch(e);
		if (e.type === "fileSelect") return fileSelect(e);
		if (e.type === "contextmenu") return contextMenu(e);
		if (e.type === "contextmenu-select") return contextMenuSelect(e);

		if (
			[
				"add-service-folder",
				"connect-service-provider",
				"open-settings-view",
				"open-previous-service",
			].includes(e.type)
		) {
			//sessionStorage.setItem("editorFile", "systemDoc::" + e.type);
			switchEditor(e.type, "systemDoc");
			return;
		}
		if (e.type === "noServiceSelected") {
			switchEditor(null, "nothingOpen");
			return;
		}
		const { name, parent, path, next, nextPath } = e.detail;

		if (e.type === "fileClose" && next && next.includes("system::")) {
			switchEditor(next.replace("system::", ""), "systemDoc");
			return;
		}

		if (e.type === "fileClose" && !next) {
			//sessionStorage.setItem("editorFile", "noFileSelected");
			switchEditor(null, "nothingOpen");
			return;
		}
		const currentFile = getCurrentFile();
		if (e.type === "fileClose" && next === currentFile) {
			return;
		}

		const filePath = getFilePath({ name, parent, path, next, nextPath });

		let savedFileName;
		if (!savedFileName && filePath) {
			//sessionStorage.setItem("editorFile", filePath);
		}
		// should include path here if needed
		switchEditor(savedFileName || filePath);
	};

	attach({
		name: "Editor",
		eventName: "service-switch-notify",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "operationDone",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "open-settings-view",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "add-service-folder",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "open-previous-service",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "connect-service-provider",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "noServiceSelected",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "fileSelect",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "fileClose",
		listener,
	});
	attach({
		name: "Editor",
		eventName: "contextmenu",
		listener,
		options: { capture: true },
	});
	attach({
		name: "Editor",
		eventName: "contextmenu-select",
		listener,
	});
}

const connectTrigger = (args) => attachTrigger({ ...args, name: "Editor" });

export { attachListener, connectTrigger };
