import editorCSS from './editor.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	editorCSS//, indexCSS
];

import { DEBUG, initState } from './utils/State.js';

import editor from './main/components/index.js'
import tabs from './tabs/components/index.js'
import status from './status/components/index.js'

import { attachEvents, list, trigger as rawTrigger  } from "./utils/EventSystem.js";
import events from './events.js';

import { getClientId } from './utils/State.js';
// used by @fiug/layout to determin active pane
document.body.addEventListener('pointerdown', () => {
	window.top.postMessage({
		triggerEvent: {
			type: 'cursorActivity',
		},
		detail: {
			source: 'Editor ' + getClientId()
		}
	}, location);
});

attachEvents(events, { editor, tabs, status });

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

