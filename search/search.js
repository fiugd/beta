import searchCSS from './search.css' assert { type: "css" };
//import indexCSS from '../index.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	searchCSS//, indexCSS
];

import devHelper from './utils/devHelper.js';
import search from './main/components/index.js';

import { attachEvents  } from "./utils/EventSystem.js";
import events from './events.js';

attachEvents(events, { search });

devHelper.module();
