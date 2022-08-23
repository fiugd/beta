import mainListeners from './main/listeners/index.js';
import mainTriggers from './main/triggers/index.js';

const listeners = [];

const triggers = {
	Tree: [{
		eventName: "fileSelect",
		type: 'raw',
	}, {
		eventName: "previewSelect",
		type: 'raw',
	}, {
		eventName: "contextMenuShow",
		type: 'raw',
	}]
};

export default { listeners, triggers };
