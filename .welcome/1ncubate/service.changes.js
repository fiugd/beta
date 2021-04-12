//show-preview

import { consoleHelper, importCSS, logJSON, fetchJSON, stringify, getStored } from '../.tools/misc.mjs';
import '../shared.styl';
consoleHelper();

const getChanges = async () => {
	// const changesUrl = '/service/read';
	// const changesUrl ="/service/provider/read/3";
	const changesUrl = "/service/change";
	const changes = await fetchJSON(changesUrl);
	logJSON(changes)
};

getChanges();
