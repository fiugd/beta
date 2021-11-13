import mainListeners from './main/listeners/index.js';
import mainTriggers from './main/triggers/index.js';

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
	eventName: "contextmenu-select",
	handlers: [
		mainListeners.contextSelect
	]
}, {
	eventName: "fileSelect",
	handlers: [
		mainListeners.fileSelect,
	]
}, {
	eventName: "fileChange",
	handlers: [ 
		mainListeners.fileChange,
	]
}, {
	eventName: "fileClose",
	handlers: [
		mainListeners.fileClose,
	]
}, {
	eventName: "showSearch",
	handlers: [
		mainListeners.showSearch,
	]
}, {
	eventName: "showServiceCode",
	handlers: [
		mainListeners.showServiceCode,
	]
}, {
	eventName: "noServiceSelected",
	handlers: [
		mainListeners.noServiceSelected
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
