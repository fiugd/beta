import { formatHandlers } from '../../utils/misc.js';

import fileSelect from './fileSelect.js';
import operationDone from './operationDone.js';
import fileClose from './fileClose.js';
import fileChange from './fileChange.js';
import contextMenu from './contextMenu.js';
import contextMenuSelect from './contextSelect.js';
import ui from './ui.js';
import click from './click.js';

const dummy = () => {};


export default {
	...formatHandlers('Tabs', {
		operationDone,
		fileSelect,
		fileClose,
		fileChange,
		contextMenu,
		contextMenuSelect,
		ui,
		click
	})
};
