import TreeView from "./TreeView.js";
import TreeModule from './TreeModule.js';

import { setState, getState } from '../../utils/State.js';
import { extensionMapper } from '../../utils/misc.js';

import "/shared/vendor/localforage.min.js";
const driver = [
	localforage.INDEXEDDB,
	localforage.WEBSQL,
	localforage.LOCALSTORAGE,
];
const changesStore = localforage.createInstance({
	driver,
	name: "service-worker",
	version: 1.0,
	storeName: "changes",
	description: "keep track of changes not pushed to provider",
});

const treeMemory = (service, tree, action) => (...args) => {
	const handlers = {
		expand: async (args) => {
			const expanded = tree.context(args[0].target).path;
			const oldExpanded = (await changesStore.getItem(`tree-${service.name}-expanded`)) || [];
			const newExpanded = oldExpanded.includes(expanded)
				? oldExpanded
				: [...oldExpanded, expanded];
			//await changesStore.setItem(`tree-${service.name}-expanded`, newExpanded);
		},
		collapse: async (args) => {
			const collapsed = tree.context(args[0].target).path;
			const oldExpanded = (await changesStore.getItem(`tree-${service.name}-expanded`)) || [];
			const newExpanded = oldExpanded.filter(x => x !== collapsed);
			//await changesStore.setItem(`tree-${service.name}-expanded`, newExpanded);
		},
		select: async (args) => {
			const selected = tree.context(args[0].target).path;
			//await changesStore.setItem(`tree-${service.name}-selected`, selected);
		}
	};
	if(!handlers[action]) return;
	handlers[action](args);
};

const newTree = ({ service, treeState }, context) => {
	const { triggers: { tree: triggers }} = context;
	//_service = service ? service.name : '';
	const treeRootId = "tree-view";
	// TODO: clear old tree if exists?

	const tree = new TreeModule(service, treeRootId, treeState, extensionMapper);
	setState("tree", tree);

	const memoryHandler = (action) => treeMemory(service, tree, action);
	tree.on('expand', memoryHandler('expand'));
	tree.on('collapse', memoryHandler('collapse'));
	tree.on('select', memoryHandler('select'));
	Object.entries(triggers)
		.forEach( ([event, handler]) => tree.on(event, handler) )
	TreeView.menu.update({ project: service.name });
};


TreeView.newTree = newTree;

export default TreeView;