import { formatHandlers } from '../../utils/misc.js';

import operationDone from './operationDone.js';
import fileSelect from './fileSelect.js';
// import fileClose from './fileClose.js';
// import contextMenu from './contextMenu.js';
// import contextMenuSelect from './contextSelect.js';
// import serviceSwitch from './serviceSwitch.js';
// const nothingOpen = (e, context) => context.editor.switchEditor({ mode: "nothingOpen" }, context);
// const systemDocs = (e, context) => context.editor.switchEditor({ filename: e.type, mode: "systemDoc" }, context);

export default formatHandlers('Tree', {
	operationDone,
	fileSelect,
	// fileClose,
	// contextMenu,
	// contextMenuSelect,
	// serviceSwitch,
	// nothingOpen,
	// systemDocs,
});