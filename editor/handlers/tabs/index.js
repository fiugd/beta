import { formatHandlers } from '../../utils/misc.js';

//import fileSelect from './fileSelect.js';
import operationDone from './operationDone.js';

const dummy = () => {};


export default {
	...formatHandlers('Tabs', {
		operationDone,
		fileSelect: dummy,
		fileClose: dummy,
		fileChange: dummy,
		contextMenu: dummy,
		contextMenuSelect: dummy,
		serviceSwitch: dummy,
		nothingOpen: dummy,
		systemDocs: dummy,
		ui: dummy,
		click: dummy
	})
};
