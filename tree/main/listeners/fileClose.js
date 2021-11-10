import fileSelectHandler from './fileSelect.js';

const listener = (e, context) => {
	fileSelectHandler({ type: 'close', ...e}, context);
};

export default listener;