import editorCSS from './editor.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	editorCSS//, indexCSS
];

import { initState, setState, getCurrentFile, getCurrentService } from './utils/State.js';

import { getFilePath as gfp } from './utils/misc.js';
const getFilePath = gfp(getCurrentService);

import EditorTabs from "./views/tabs/tabs.js";
import EditorStatus from "./views/status/status.js";
import inlineEditor from './views/editor/editor.js';
import { switchEditor, messageEditor } from './views/editor/switcher.js';

import { attachEvents, list, trigger as rawTrigger  } from "./utils/EventSystem.js";
import events from './events.js';
import CursorActivityHandler from './handlers/editor/cursor.js';
import ChangeHandler from './handlers/editor/change.js';

function _Editor(callback) {
	//TODO: ChangeHandler and CursorActivityHandler should come from triggers

	//debugger; //enable this debugger to see what UI looks like at this point

	// call editor tabs once early so event handlers are attached
	const tabs = EditorTabs();
	const status = EditorStatus();
	const editor = inlineEditor(ChangeHandler, EditorTabs, CursorActivityHandler);

	const context = {
		getCurrentFile, // << access within file instead
		getFilePath, // << access within file instead
		showMenu: () => window.showMenu,
		switchEditor: (x) => switchEditor(x, { editor, context }),
		messageEditor: (x) => messageEditor(x,{ editor, context }),
		systemDocsErrors: [],
		tabs,
		status
	};
	attachEvents(events, context);
}


const Editor = _Editor;

const isRunningAsModule = document.location.href.includes("_/modules");

if(!isRunningAsModule){
	const base = document.createElement('base');
	base.href = '../../';
	document.getElementsByTagName('head')[0].appendChild(base);
}

Editor();

const currentServiceId = localStorage.getItem('lastService');
const serviceUrl = `/service/read/${currentServiceId}`;
const { result: [currentService] } = await fetch(serviceUrl).then(x => x.json())

const service = currentService;
service.state.selected = {
	name: service.state.selected.split('/').pop(),
	path: `${service.name}/${service.state.selected}`
}
console.log(service)
// const service = {
// 	name: 'crosshj/fake',
// 	state: {
// 		selected: {
// 			// line: 2, << causes focus to be stolen
// 			// column: 0, << causes focus to be stolen
// 			id: '1',
// 			name: 'editor.js',
// 			filename: 'editor.js',
// 			path: '/crosshj/fiug-beta/editor/editor.js',
// 		},
// 		opened: [
// 			{ name: 'editor.js', order: 0 },
// 			{ name: 'index.colors.css', order: 1 },
// 			{ name: '404.html', order: 2 },
// 			{ name: 'index.html', order: 3 }
// 		],
// 		changed: ['index.html']
// 	},
// 	code: [{
// 		name: 'index.colors.css',
// 		code: '/crosshj/fiug-beta/index.colors.css',
// 		path: '/crosshj/fiug-beta/index.colors.css'
// 	},{
// 		name: '404.html',
// 		code: '/crosshj/fiug-beta/404.html',
// 		path: '/crosshj/fiug-beta/404.html'
// 	},{
// 		name: 'index.html',
// 		code: '/crosshj/fiug-beta/index.html',
// 		path: '/crosshj/fiug-beta/index.html',
// 	},{
// 		name: 'editor.js',
// 		code: '/crosshj/fiug-beta/editor/editor.js',
// 		path: '/crosshj/fiug-beta/editor/editor.js'
// 	}],
// 	tree: {
// 		'crosshj/fake': {
// 			'404.html': {},
// 			'index.colors.css': {},
// 			'index.html': {},
// 			editor: {
// 				'events.js': {}
// 			}
// 		}
// 	}
// };

initState([service], service);

rawTrigger({
	e: {},
	type: 'operationDone',
	params: {},
	source: {},
	data: {},
	detail: {
		op: 'read',
		id: 1,
		result: [service]
	}
});

console.log(
	'Listeners:\n' + 
	list().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
)

console.log(
	'Triggers:\n' + 
	listTriggers().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
)
