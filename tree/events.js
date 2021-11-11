import mainListeners from './main/listeners/index.js';
import mainTriggers from './main/triggers/index.js';

// import tabsListeners from './tabs/listeners/index.js';
// import tabsTriggers from './tabs/triggers/index.js';

// import statusListeners from './status/listeners/index.js';
// //import statusTriggers from './status/triggers/index.js';

const listeners = [{
	eventName: "operationDone",
	handlers: [
		mainListeners.operationDone,
	]
}, {
	eventName: "contextmenu",
	handlers: [
		{ ...mainListeners.contextMenu, options: { capture: true } },
	]
}, {
	eventName: "fileSelect",
	handlers: [
		mainListeners.fileSelect,
	]
}];

const triggers = {
	Tree: [{
		eventName: "operations",
		type: 'raw',
		handlers: [ mainTriggers.operations ]
	}, {
		eventName: "fileSelect",
		type: 'raw',
	}, {
		eventName: "contextMenuShow",
		type: 'raw',
	}]
};

export default { listeners, triggers };
