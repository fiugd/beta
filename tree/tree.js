import treeCSS from './tree.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	treeCSS//, indexCSS
];

import devHelper from './utils/devHelper.js';
import tree from './main/components/index.js';

import { attachEvents  } from "./utils/EventSystem.js";
import events from './events.js';

import { getClientId } from './utils/State.js';
// used by @fiug/layout to determin active pane
document.body.addEventListener('pointerdown', () => {
	window.top.postMessage({
		triggerEvent: {
			type: 'cursorActivity',
		},
		detail: {
			source: 'Tree ' + getClientId()
		}
	}, location);
});

attachEvents(events, { tree });

devHelper.module();
