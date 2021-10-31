import editorCSS from './editor.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	editorCSS//, indexCSS
];

import { 
	DEBUG, initState, setState, getCurrentFile, getCurrentService
} from './utils/State.js';

import { getFilePath as gfp } from './utils/misc.js';
const getFilePath = gfp(getCurrentService);

import EditorTabs from "./views/tabs/tabs.js";
import EditorStatus from "./views/status/status.js";
import editor from './views/editor/editor.js';
import { switchEditor, messageEditor } from './views/editor/switcher.js';

import { attachEvents, list, trigger as rawTrigger  } from "./utils/EventSystem.js";
import events from './events.js';

const tabs = EditorTabs();
const status = EditorStatus();

const context = {
	getCurrentFile, // << access within file instead
	getFilePath, // << access within file instead

	switchEditor: (x) => switchEditor(x, { editor, context }),
	messageEditor: (x) => messageEditor(x,{ editor, context }),
	systemDocsErrors: [],

	editor,
	tabs,
	status
};
attachEvents(events, context);


const isRunningAsModule = document.location.href.includes("_/modules");

if(!isRunningAsModule){
	const base = document.createElement('base');
	base.href = '../../';
	document.getElementsByTagName('head')[0].appendChild(base);
}

const currentServiceId = localStorage.getItem('lastService');
const serviceUrl = `/service/read/${currentServiceId}`;
const { result: [service] } = await fetch(serviceUrl).then(x => x.json())
service.state.selected = {
	name: service.state.selected.split('/').pop(),
	path: `${service.name}/${service.state.selected}`
}
DEBUG && console.log(service)

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

DEBUG && console.log(
	'Listeners:\n' + 
	list().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
);

DEBUG && console.log(
	'Triggers:\n' + 
	listTriggers().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
);
