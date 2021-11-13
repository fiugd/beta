import { formatHandlers } from '../../utils/misc.js';

import contextMenu from './contextMenu.js';
import contextSelect from './contextSelect.js';
import fileChange from './fileChange.js';
import fileClose from './fileClose.js';
import fileSelect from './fileSelect.js';
import folderSelect from './folderSelect.js';
import noServiceSelected from './noServiceSelected.js';
import operationDone from './operationDone.js';
import showSearch from './showSearch.js';
import showServiceCode from './showServiceCode.js';
import ui from './ui.js';

export default formatHandlers('Tree', {
	contextMenu,
	contextSelect,
	fileChange,
	fileClose,
	fileSelect,
	folderSelect,
	noServiceSelected,
	operationDone,
	showSearch,
	showServiceCode,
	ui,
});

/*

also see event handling in:
	tree/main/components/ProjectOpener.js
	tree/main/components/TreeMenu.js

*/
