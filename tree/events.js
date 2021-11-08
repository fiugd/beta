import mainListeners from './main/listeners/index.js';
// import mainTriggers from './main/triggers/index.js';

// import tabsListeners from './tabs/listeners/index.js';
// import tabsTriggers from './tabs/triggers/index.js';

// import statusListeners from './status/listeners/index.js';
// //import statusTriggers from './status/triggers/index.js';

const listeners = [{
// 	eventName: "service-switch-notify",
// 	handlers: [ mainListeners.serviceSwitch ]
// }, {
// 	eventName: "cursorActivity",
// 	handlers: [ statusListeners.cursorActivity ]
// }, {
	eventName: "operationDone",
	handlers: [
		mainListeners.operationDone,
	]
}, {
// 	eventName: "operations",
// 	handlers: [ tabsListeners.operationDone ]
// }, {
// 	eventName: "open-settings-view",
// 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
// }, {
// 	eventName: "add-service-folder",
// 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
// }, {
// 	eventName: "open-previous-service",
// 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
// }, {
// 	eventName: "connect-service-provider",
// 	handlers: [ mainListeners.systemDocs, tabsListeners.fileSelect ]
// }, {
// 	eventName: "noServiceSelected",
// 	handlers: [ mainListeners.nothingOpen ]
// }, {
	eventName: "fileSelect",
	handlers: [
		mainListeners.fileSelect,
	]
}, //{
// 	eventName: "fileClose",
// 	handlers: [
// 		mainListeners.fileClose,
// 	]
// }, {
// 	eventName: "fileChange",
// 	handlers: [ tabsListeners.fileChange, statusListeners.fileChange ]
// }, {
// 	eventName: "contextmenu",
// 	handlers: [
// 		{ ...mainListeners.contextMenu, options: { capture: true } },
// 		{ ...tabsListeners.contextMenu, options: { capture: true } },
// 	]
// }, {
// 	eventName: "contextmenu-select",
// 	handlers: [ mainListeners.contextMenuSelect, tabsListeners.contextMenuSelect ]
// }, {
// 	eventName: "ui",
// 	handlers: [ tabsListeners.ui ]
// //DEPRECATE listener click (ui should call trigger)
// }, {
// 	eventName: "click",
// 	handlers: [ tabsListeners.click ]
//}];
];

// const triggers = {
// 	Editor: [{
// 			eventName: "ui",
// 			type: "raw",
// 		}, {
// 			eventName: "fileClose",
// 			type: 'raw',
// 		}, {
// 			eventName: "fileSelect",
// 			type: 'raw',
// 		}, {
// 			eventName: "contextMenuShow",
// 			type: 'raw',
// 		}, {
// 			eventName: "fileChange",
// 			type: 'raw',
// 			handlers: [ mainTriggers.fileChange ]
// 		}, {
// 			eventName: "cursorActivity",
// 			type: 'raw',
// 			handlers: [ mainTriggers.cursorActivity ]
// 		}, {
// 			eventName: "provider-test",
// 			type: 'click',
// 			handlers: [ mainTriggers.provider.test ]
// 		}, {
// 			eventName: "provider-save",
// 			type: 'click',
// 			handlers: [ mainTriggers.provider.save ]
// 		}, {
// 			eventName: "provider-add-service",
// 			type: 'click',
// 			handlers: [ mainTriggers.provider.addService ]
// 		}], 
// 	Tabs: [{
// 			eventName: "ui",
// 			type: "raw",
// 		}, {
// 			eventName: "fileClose",
// 			type: 'raw',
// 		}, {
// 			name: "closeOthers",
// 			eventName: "fileClose",
// 			type: 'raw',
// 			handlers: [ tabsTriggers.closeMultiple.others ]
// 		}, {
// 			name: "closeAll",
// 			eventName: "fileClose",
// 			type: 'raw',
// 			handlers: [ tabsTriggers.closeMultiple.all ]
// 		}, {
// 			eventName: "fileSelect",
// 			type: 'raw',
// 		}, {
// 			eventName: "contextMenuShow",
// 			type: 'raw',
// 		}, {
// 			name: "addFileUntracked",
// 			eventName: "operations",
// 			type: 'raw',
// 			data: {
// 				operation: "addFile",
// 				untracked: true,
// 			},
// 		}],
// 	Status: [{
// 			eventName: "ui",
// 			type: "raw",
// 		}, {
// 			eventName: "fileClose",
// 			type: 'raw',
// 		}, {
// 			eventName: "fileSelect",
// 			type: 'raw',
// 		}],
// };

// export default { listeners, triggers };


const triggers = {
	Tree: []
};

export default { listeners, triggers };
