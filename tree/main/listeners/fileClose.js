import fileSelectHandler from './fileSelect.js';

const fileCloseListener = (e, context) => {
	const { treeSelect } = context.tree.api;

	if (!e?.detail?.next) {
		treeSelect(null, null, 'noEmit');
		return;
	}

	// will select next file
	fileSelectHandler(e, context);
};

export default fileCloseListener;