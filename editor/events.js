import editor from './handlers/editor/index.js';
import tabs from './handlers/tabs/index.js';


const listeners = [{
	eventName: "service-switch-notify",
	handlers: [ editor.serviceSwitch ]
}, {
	eventName: "operationDone",
	handlers: [ editor.operationDone, tabs.operationDone ]
}, {
	eventName: "operations",
	handlers: [ tabs.operationDone ]
}, {
	eventName: "open-settings-view",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "add-service-folder",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "open-previous-service",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "connect-service-provider",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "noServiceSelected",
	handlers: [ editor.nothingOpen ]
}, {
	eventName: "fileSelect",
	handlers: [ editor.fileSelect, tabs.fileSelect ]
}, {
	eventName: "fileClose",
	handlers: [ editor.fileClose, tabs.fileClose ]
}, {
	eventName: "fileChange",
	handlers: [ tabs.fileChange ]
}, {
	eventName: "contextmenu",
	handlers: [
		{ ...editor.contextMenu, options: { capture: true } },
		{ ...tabs.contextMenu, options: { capture: true } },
	]
}, {
	eventName: "contextmenu-select",
	handlers: [ editor.contextMenuSelect, tabs.contextMenuSelect ]
}, {
	eventName: "ui",
	handlers: [ tabs.ui ]
//DEPRECATE listener click (ui should call trigger)
}, {
	eventName: "click",
	handlers: [ tabs.click ]
}];

const triggers = [{
	eventName: "ui",
	type: "raw",
}, {
	eventName: "fileClose",
	type: 'raw',
}, {
	eventName: "fileSelect",
	type: 'raw',
}, {
	name: "addFileUntracked",
	eventName: "operations",
	type: 'raw',
	data: {
		operation: "addFile",
		untracked: true,
	},
//DEPRECATE trigger click pattern
}, {
	eventName: "provider-test",
	type: 'click',
	handlers: [ editor.provider.test ]
}, {
	eventName: "provider-save",
	type: 'click',
	handlers: [ editor.provider.save ]
}, {
	eventName: "provider-add-service",
	type: 'click',
	handlers: [ editor.provider.addService ]
}];

export default { listeners, triggers };