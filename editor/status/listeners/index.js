import { formatHandlers } from '../../utils/misc.js';

import cursorActivity from './cursorActivity.js';
import fileChange from './fileChange.js';
import fileSelect from './fileSelect.js';
import fileClose from './fileClose.js';
import operationDone from './operationDone.js';


export default formatHandlers('Status', {
    cursorActivity,
    fileChange,
    fileSelect,
    fileClose,
    operationDone,
});
