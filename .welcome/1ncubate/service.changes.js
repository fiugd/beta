//show-preview

import { consoleHelper, importCSS, logJSON, fetchJSON, stringify, getStored } from '../.tools/misc.mjs';
import '../shared.styl';
consoleHelper();

const getChanges = async () => {
	const changesUrl = "/service/change";
	const changesResponse = await fetchJSON(changesUrl+"?cwd=.welcome/1ncubate");
	
	logJSON(changesResponse);
};
getChanges();
