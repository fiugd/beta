import fileSelectHandler from './fileSelect.js';

const fileCloseListener = (e, context) => {
	if (!e?.detail?.next) {
		//TODO: should be triggering a deselect with tree
		return;
	}
	fileSelectHandler(e, context);
};

export default fileCloseListener;