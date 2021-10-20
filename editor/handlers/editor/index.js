import { formatHandlers } from '../../utils/misc.js';

//listeners
import operationDone from './operationDone.js';
import fileSelect from './fileSelect.js';
import fileClose from './fileClose.js';
import contextMenu from './contextMenu.js';
import contextMenuSelect from './contextSelect.js';
import serviceSwitch from './serviceSwitch.js';
const nothingOpen = (e, { switchEditor }) => switchEditor(null, "nothingOpen");
const systemDocs = (e, { switchEditor }) => switchEditor(e.type, "systemDoc");

//triggers
import provider from './provider.js'

export default {
	...formatHandlers('Editor', {
		operationDone,
		fileSelect,
		fileClose,
		contextMenu,
		contextMenuSelect,
		serviceSwitch,
		nothingOpen,
		systemDocs,
	}),
	provider
};
