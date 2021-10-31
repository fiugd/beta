import { formatHandlers } from '../../utils/misc.js';

import fileSelect from './fileSelect.js';
import operations from './operations.js';
import operationDone from './operationDone.js';
import fileClose from './fileClose.js';
import fileChange from './fileChange.js';
import contextMenu from './contextMenu.js';
import contextMenuSelect from './contextSelect.js';
import ui from './ui.js';
import click from './click.js';
import systemDocs from './systemDocs.js';

//triggers
import closeMultiple from './closeMultiple.js';

export default {
	...formatHandlers('Tabs', {
		operations,
		operationDone,
		fileSelect,
		fileClose,
		fileChange,
		contextMenu,
		contextMenuSelect,
		ui,
		click,
		systemDocs,
	}),
	closeMultiple,
};
