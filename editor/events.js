import editor from './handlers/editor/index.js';
//import tabs from './handlers/tabs/index.js';


const listeners = [{
	eventName: "service-switch-notify",
	handlers: [ editor.serviceSwitch ]
}, {
	eventName: "operationDone",
	handlers: [ editor.operationDone ]
}, {
	eventName: "open-settings-view",
	handlers: [ editor.systemDocs ]
}, {
	eventName: "add-service-folder",
	handlers: [ editor.systemDocs ]
}, {
	eventName: "open-previous-service",
	handlers: [ editor.systemDocs ]
}, {
	eventName: "connect-service-provider",
	handlers: [ editor.systemDocs ]
}, {
	eventName: "noServiceSelected",
	handlers: [ editor.nothingOpen ]
}, {
	eventName: "fileSelect",
	handlers: [ editor.fileSelect ]
}, {
	eventName: "fileClose",
	handlers: [ editor.fileClose ]
}, {
	eventName: "contextmenu",
	handlers: [{ ...editor.contextMenu, options: { capture: true } }]
}, {
	eventName: "contextmenu-select",
	handlers: [ editor.contextMenuSelect ]
}];

const triggers = [{
	eventName: "ui",
	type: "raw",
	handlers: []
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