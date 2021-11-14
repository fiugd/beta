import { getState } from '../../utils/State.js';

const contextMenuHandler = (e, listenerContext) => {
	const { 
		tree,
		triggers: { tree: triggers }
	} = listenerContext;
	const { treeContext } = tree.api;
	const clipboard = getState('clipboard');

	/*
		TreeView module should have a right click listener
		it should call handler with info about the thing that was clicked
		
		this should be wired up in UI, each menu item should contain trigger
	*/
	if (!tree.contains(e.target)) {
		return true;
	}
	e.preventDefault();

	const context = treeContext(e.target);

	const listItems = [
		{
			name: "New File",
		},
		{
			name: "New Folder",
		},

		context.type === 'file' ? "seperator" : '',
		{
			name: "Open in Preview",
			hidden: context.type === 'folder'
		},
		{
			name: "Open in New Window",
			hidden: context.type === 'folder'
		},
		{
			name: "Open in Terminal",
			hidden: true //TODO: revisit this with terminal revamp
		},

		"seperator",
		{
			name: "Cut",
		},
		{
			name: "Copy",
		},
		{
			name: "Paste",
			hidden: !clipboard || context.type === 'file'
		},
		"seperator",
		{
			name: "Copy Path",
		},
		{
			name: "Copy Relative Path",
		},
		"seperator",
		{
			name: "Rename",
		},
		{
			name: "Delete",
		},
	].filter(x => !!x && !x.hidden);

	triggers.contextMenuShow({
		detail: {
			x: e.clientX,
			y: e.clientY,
			list: listItems,
			parent: "Tree",
			data: context,
	}});
	return false;
};

export default contextMenuHandler;
