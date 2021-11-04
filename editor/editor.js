import editorCSS from './editor.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	editorCSS//, indexCSS
];

import { 
	DEBUG, initState, getCurrentFile, getCurrentService
} from './utils/State.js';

import { getFilePath as gfp } from './utils/misc.js';
const getFilePath = gfp(getCurrentService);

import editor from './main/components/index.js'
import { switchEditor, messageEditor } from './main/components/switcher.js'
import { tabs } from './tabs/tabs.js'
import { status } from './status/status.js'

import { attachEvents, list, trigger as rawTrigger  } from "./utils/EventSystem.js";
import events from './events.js';

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

const isPreview = document.location.href.includes("/::preview::/");
if(isPreview){
	const base = document.createElement('base');
	base.href = '../../';
	document.getElementsByTagName('head')[0].appendChild(base);
}

const isRunningAsModule = document.location.href.includes("_/modules");
if(!isRunningAsModule){
	const ROOT_SERVICE_ID = 0;
	const currentServiceId = localStorage.getItem('lastService') || ROOT_SERVICE_ID;
	const serviceUrl = `/service/read/${currentServiceId}`;
	const { result: [service] } = await fetch(serviceUrl).then(x => x.json())
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
			id: service.id,
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
}

