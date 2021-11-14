import TreeView from "./TreeView.js";
import TreeModule from './TreeModule.js';

import { setState, getState, treeMemory } from '../../utils/State.js';
import { extensionMapper } from '../../utils/misc.js';

const newTree = ({ service, treeState }, context) => {
	const { events: triggers } = context.tree;
	//_service = service ? service.name : '';
	const treeRootId = "tree-view";
	// TODO: clear old tree if exists?

	const tree = new TreeModule(service, treeRootId, treeState, extensionMapper);
	setState("tree", tree);
	const methods = [
		'Add', 'Delete', 'Select', 'Move', 'Rename', 'Context', 'Change', 'ClearChanged'
	].reduce((all, one) => {
			all['tree'+one] = (...args) => {
				try {
					if(!tree) return; //should keep track of this instead of blindly returning
					if(one === 'Add' && typeof args[2] === 'undefined'){
						return tree.add(args[0], null, tree.currentFolder || '');
					}
					if(one === 'ClearChanged'){
						return tree.clearChanged();
					}
					return tree[one.toLowerCase()](...args);
				} catch(e){
					console.warn(e);
				}
			}
			return all;
	}, {});
	context.tree.api = methods; 

	const memoryHandler = (action) => ({ target }) => {
		const { path } = tree.context(target);
		treeMemory[action](path);
	}
	tree.on('expand', memoryHandler('expand'));
	tree.on('collapse', memoryHandler('collapse'));
	tree.on('select', memoryHandler('select'));
	Object.entries(triggers)
		.forEach( ([event, handler]) => tree.on(event, handler(context)) )
	TreeView.menu.update({ project: service.name });
};

TreeView.newTree = newTree;

function treeDomNodeFromPath(path) {
	if (!path) {
		return document.querySelector("#tree-view");
	}
	const leaves = Array.from(
		document.querySelectorAll("#tree-view .tree-leaf-content")
	);
	const name = path.split("/").pop();
	const found = leaves.find((x) => JSON.parse(x.dataset.item).name === name);
	return found;
}

function newFile({ parent, onDone }) {
	if (!onDone) {
		return console.error("newFile requires an onDone event handler");
	}
	const parentDOM = treeDomNodeFromPath(parent);
	let nearbySibling;
	if (parent) {
		const expando = parentDOM.querySelector(".tree-expando");
		expando.classList.remove("closed");
		expando.classList.add("expanded", "open");
		const childLeaves = parentDOM.parentNode.querySelector(
			".tree-child-leaves"
		);
		childLeaves.classList.remove("hidden");
		nearbySibling = childLeaves.querySelector(".tree-leaf");
	} else {
		try {
			nearbySibling = Array.from(parentDOM.children).find(
				(x) =>
					JSON.parse(x.querySelector(".tree-leaf-content").dataset.item)
						.children.length === 0
			);
		} catch (e) {}
	}
	if (!nearbySibling) {
		console.error("unable to add new file; error parsing DOM");
		return;
	}
	const paddingLeft = nearbySibling.querySelector(".tree-leaf-content").style
		.paddingLeft;
	const newFileNode = htmlToElement(`
		<div class="tree-leaf new">
			<div class="tree-leaf-content" style="padding-left: ${paddingLeft};">
				<div class="tree-leaf-text icon-default">
					<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				</div>
			</div>
		</div>
		`);
	const fileNameInput = newFileNode.querySelector("input");
	const finishInput = (event) => {
		if (event.key && event.key !== "Enter") {
			return;
		}
		const filename = fileNameInput.value;

		fileNameInput.removeEventListener("blur", finishInput);
		fileNameInput.removeEventListener("keyup", finishInput);
		if (!filename) {
			return;
		}

		newFileNode.classList.add("creating");
		fileNameInput.disabled = true;
		onDone(filename, parent);
	};
	fileNameInput.addEventListener("blur", finishInput);
	fileNameInput.addEventListener("keyup", finishInput);

	//TODO: focus input, when input loses focus create real file
	//TODO: when ENTER is pressed, create real file (or add a cool error box)
	nearbySibling.parentNode.insertBefore(newFileNode, nearbySibling);
	fileNameInput.focus();
}
TreeView.newFile = newFile;

function newFolder({ parent, onDone }) {
	if (!onDone) {
		return console.error("newFolder requires an onDone event handler");
	}
	const parentDOM = treeDomNodeFromPath(parent);
	const expando = parentDOM.querySelector(".tree-expando");
	expando.classList.remove("closed");
	expando.classList.add("expanded", "open");
	const childLeaves = parentDOM.parentNode.querySelector(".tree-child-leaves");
	childLeaves.classList.remove("hidden");
	const nearbySibling = childLeaves.querySelector(".tree-leaf");
	const paddingLeft = nearbySibling.querySelector(".tree-leaf-content").style
		.paddingLeft;
	const newFolderNode = htmlToElement(`
		<div class="tree-leaf new">
			<div class="tree-leaf-content" style="padding-left: ${paddingLeft};">
				<div class="tree-leaf-text icon-default">
					<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				</div>
			</div>
		</div>
	`);
	const folderNameInput = newFolderNode.querySelector("input");
	const finishInput = (event) => {
		if (event.key && event.key !== "Enter") {
			return;
		}
		const foldername = folderNameInput.value;

		folderNameInput.removeEventListener("blur", finishInput);
		folderNameInput.removeEventListener("keyup", finishInput);
		newFolderNode.parentNode.removeChild(newFolderNode);

		if (!foldername) {
			return;
		}
		onDone(foldername, parent);
	};
	folderNameInput.addEventListener("blur", finishInput);
	folderNameInput.addEventListener("keyup", finishInput);

	//TODO: focus input, when input loses focus create real folder
	//TODO: when ENTER is pressed, create real folder (or add a cool error box)
	nearbySibling.parentNode.insertBefore(newFolderNode, nearbySibling);
	folderNameInput.focus();
}
TreeView.newFolder = newFolder;

const attachListener = () => {};
const connectTrigger = (args) => {
	const {eventName} = args;
	return (body, context) => {
		const thisTrigger = context.triggers.tree[eventName];
		if(!thisTrigger) {
			console.log(`trigger not registered for ${eventName}`)
			return;
		}
		thisTrigger(body);
		//console.log({eventName, body});
	}
};
const Update = () => {};

// attachListener(Update, {
// 	...treeMethods,
// 	newFile: ({ parent }) => tree.add('file', null, parent),
// 	newFolder: ({ parent }) => tree.add('folder', null, parent),
// 	//showSearch: showSearch(treeView),
// 	//updateTreeMenu,
// 	//showServiceChooser: showServiceChooser(treeView),
// });

// these get attached each newly created tree module
const treeEvents = [
	'fileSelect',
	'fileAdd',
	'fileRename',
	'fileMove',
	'fileDelete',

	'folderSelect',
	'folderAdd',
	'folderRename',
	'folderMove',
	'folderDelete'
];
const triggers = treeEvents.reduce((all, operation) => {
	const handler = connectTrigger({
		eventName: operation.includes('Select')
			? operation
			: 'operations',
		type: "raw",
	});
	const operationAdapt = {
		fileAdd: 'addFile',
		fileDelete: 'deleteFile',
		fileRename: 'renameFile',
		fileMove: 'moveFile',

		folderAdd: 'addFolder',
		folderDelete: 'deleteFolder',
		folderRename: 'renameFolder',
		folderMove: 'moveFolder',
	};
	const treeEventHandler = (context) => (args) => {
		//console.log({ context, args });
		const { source, target, line, column } = args;
		const name = (target || source).split('/').pop();
		const parent = (target || source).split('/').slice(0,-1).join('/');
		const _service = 'TODO';
		const handlerMessage = {
			detail: {
				name,
				oldName: source,
				newName: target,
				src: source,
				tgt: target,
				parent,
				operation: operationAdapt[operation] || operation,
				filename: name,
				folderName: name,
				line, column,
				body: {},
				service: _service || '',
			}
		};
		return handler(handlerMessage, context);
	};

	all[operation] = treeEventHandler;
	return all;
}, {});

TreeView.events = triggers;

export default TreeView;