import { setState, getState } from '../../utils/State.js';
import { getCurrentService } from "../../utils/State.js";

const contextSelectListener = (e, context) => {
	let clipboard = getState('clipboard');
	const {
		treeAdd, treeRename, treeDelete, treeMove
	} = context.tree.api;
	const { triggers: { tree: triggers} } = context;
	const { which, parent, data } = e.detail || {};
	if (parent !== "Tree") {
		//console.log('TreeView ignored a context-select event');
		return;
	}

	const service = getCurrentService();

	// this should in a listener for 'addFile'
	if (["New File", "New Folder"].includes(which)) {
		const parent = data.type === 'file'
			? data.parent.path
			: data.path;
		const typeToAdd = which === 'New File'
			? 'file'
			: 'folder';
		return treeAdd(typeToAdd, null, parent);
	}
	if (which === "Delete") return treeDelete(data.path);
	if (which === "Rename") return treeRename(data.path);

	if(which === 'Cut'){
		clipboard = { operation: 'cut', data };
	}
	if(which === 'Copy'){
		clipboard = { operation: 'copy', data };
	}
	if(which === 'Paste'){
		const isMove = clipboard.operation === 'cut';
		const target = data;
		const source = clipboard.data;
		clipboard = undefined;

		isMove
			? console.log(`paste should be a move`)
			: console.log(`paste should be an add`)
		console.log({ clipboard, data });

		// TODO: should update tree, but...
		// really should trigger file and folder copy/move
		if(isMove){
			treeMove(clipboard.data.type, source, target);
		} else {
			treeAdd(clipboard.data.type, source, target);
		}
	}

	if (["Copy Path", "Copy Relative Path"].includes(which)) {
		const path = which.includes('Relative')
			? data.path
			: new URL(`${service.name}/${data.path}`, document.referrer).href;
		window.focus();
		navigator.clipboard
			.writeText(path)
			.then((x) => console.log(`Wrote path to clipboard: ${path}`))
			.catch((e) => {
				console.error(`Error writing path to clipboard: ${path}`);
				console.error(e);
			});
	}

	if (which === "Open in New Window") {
		const path = new URL(`${service.name}/${data.path}`, document.referrer).href;
		const shouldNotPreview = [
			".svg",
			".less",
			".scss",
			".css",
			".json",
			".txt",
			".mjs",
		].find((x) => path.includes(x));
		// overrides shouldNotPreview
		const shouldPreview = [
			".jsx"
		].find((x) => path.includes(x));
		const query = shouldNotPreview && !shouldPreview
			? ""
			: "/::preview::/";
		window.open(path + query);
	}

	if (which === "Open in Preview") {
		triggers.previewSelect({ detail: data });
	}

	setState('clipboard', clipboard);
};

export default contextSelectListener;
