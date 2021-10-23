import { initState, setState, getCurrentFile, getCurrentService } from './state.js';

import { getFilePath as gfp } from './utils/misc.js';
const getFilePath = gfp(getCurrentService);

import EditorTabs from "./editorTabs.js";
import EditorStatus from "./editorStatus.js";
import inlineEditor from './views/inlineEditor.js';
import { switchEditor, messageEditor } from './views/switcher.js';

import { attachEvents, list, trigger as rawTrigger  } from "./Listeners.js";
import events from './events.js';
import CursorActivityHandler from './handlers/editor/cursor.js';
import ChangeHandler from './handlers/editor/change.js';

import "../shared/vendor/localforage.min.js";

function _Editor(callback) {
	//TODO: ChangeHandler and CursorActivityHandler should come from triggers
	//

	//debugger; //enable this debugger to see what UI looks like at this point

	// call editor tabs once early so event handlers are attached
	const tabs = EditorTabs();
	EditorStatus();
	const editor = inlineEditor(ChangeHandler, EditorTabs, CursorActivityHandler);

	const context = {
		getCurrentFile, // << access within file instead
		getFilePath, // << access within file instead
		showMenu: () => window.showMenu,
		switchEditor: (x) => switchEditor(x, { editor, context }),
		messageEditor: (x) => messageEditor(x,{ editor, context }),
		systemDocsErrors: [],
		tabs,
	};
	attachEvents(events, context);
}






const Editor = _Editor;;

const isRunningAsModule = document.location.href.includes("_/modules");

if(!isRunningAsModule){
	const base = document.createElement('base');
	base.href = '../../';
	document.getElementsByTagName('head')[0].appendChild(base);
}

const head=document.getElementsByTagName("head")[0];

const cssnode = document.createElement('link');
cssnode.type = 'text/css';
cssnode.rel = 'stylesheet';
cssnode.href = './editor.css';
head.appendChild(cssnode);

window.showMenu = () => true;
Editor();

const service = {
	name: 'crosshj/fake',
	state: {
		selected: {
			// line: 2, << causes focus to be stolen
			// column: 0, << causes focus to be stolen
			id: '1',
			name: 'editorTabsEvents.js',
			filename: 'editorTabsEvents.js',
			path: '/crosshj/fiug-beta/editor/editorTabsEvents.js',
		},
		opened: [
			{ name: 'editorTabsEvents.js', order: 0 },
			{ name: 'index.colors.css', order: 1 },
			{ name: '404.html', order: 2 },
			{ name: 'index.html', order: 3 }
		],
		changed: ['index.html']
	},
	code: [{
		name: 'index.colors.css',
		code: '/crosshj/fiug-beta/index.colors.css',
		path: '/crosshj/fiug-beta/index.colors.css'
	},{
		name: '404.html',
		code: '/crosshj/fiug-beta/404.html',
		path: '/crosshj/fiug-beta/404.html'
	},{
		name: 'index.html',
		code: '/crosshj/fiug-beta/index.html',
		path: '/crosshj/fiug-beta/index.html',
	},{
		name: 'editorTabsEvents.js',
		code: '/crosshj/fiug-beta/editor/editorTabsEvents.js',
		path: '/crosshj/fiug-beta/editor/editorTabsEvents.js'
	}],
	tree: {
		'crosshj/fake': {
			'404.html': {},
			'index.colors.css': {},
			'index.html': {},
			editor: {
				'events.js': {}
			}
		}
	}
};

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
	list().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
)
