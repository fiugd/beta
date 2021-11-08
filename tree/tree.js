import treeCSS from './tree.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	treeCSS//, indexCSS
];

import devHelper from './utils/devHelper.js';
import tree from './main/components/index.js';

import { attachEvents, list, trigger as rawTrigger  } from "./utils/EventSystem.js";
import events from './events.js';



attachEvents(events, { tree });

devHelper.module();
