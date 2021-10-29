import { formatHandlers } from '../../utils/misc.js';

import fileChange from './fileChange.js';
import fileSelect from './fileSelect.js';
import fileClose from './fileClose.js';
import operationDone from './operationDone.js';

//triggers

export default {
	...formatHandlers('Status', {
		fileChange,
		fileSelect,
		fileClose,
		operationDone,
	})
};
