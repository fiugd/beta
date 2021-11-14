import fileSelectHandler from './fileSelect.js';

const fileCloseListener = (e, context) => {
	fileSelectHandler({ type: 'close', ...e}, context);
};

export default fileCloseListener;