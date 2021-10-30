import editor from './handlers/editor/index.js';
import tabs from './handlers/tabs/index.js';
import status from './handlers/status/index.js';

const listeners = [{
	eventName: "service-switch-notify",
	handlers: [ editor.serviceSwitch ]
}, {
	eventName: "cursorActivity",
	handlers: [ status.cursorActivity ]
}, {
	eventName: "operationDone",
	handlers: [ editor.operationDone, tabs.operationDone, status.operationDone ]
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
	handlers: [ editor.fileSelect, tabs.fileSelect, status.fileSelect ]
}, {
	eventName: "fileClose",
	handlers: [ editor.fileClose, tabs.fileClose, status.fileClose ]
}, {
	eventName: "fileChange",
	handlers: [ tabs.fileChange, status.fileChange ]
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

const triggers = {
	Editor: [{
			eventName: "ui",
			type: "raw",
		}, {
			eventName: "fileClose",
			type: 'raw',
		}, {
			eventName: "fileSelect",
			type: 'raw',
		}, {
			eventName: "contextMenuShow",
			type: 'raw',
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
		}],
	Tabs: [{
			eventName: "ui",
			type: "raw",
		}, {
			eventName: "fileClose",
			type: 'raw',
		}, {
			eventName: "fileSelect",
			type: 'raw',
		}, {
			eventName: "contextMenuShow",
			type: 'raw',
		}, {
			name: "addFileUntracked",
			eventName: "operations",
			type: 'raw',
			data: {
				operation: "addFile",
				untracked: true,
			},
		}],
	Status: [{
			eventName: "ui",
			type: "raw",
		}, {
			eventName: "fileClose",
			type: 'raw',
		}, {
			eventName: "fileSelect",
			type: 'raw',
		}],
};

export default { listeners, triggers };