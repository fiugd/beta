import getApi from './api.js';
import testlib from "/fiugd/beta/test/testlib.js";
const { describe, it, start: TestStart, expect, logJSON, safe } = testlib;

const mockTabs = () => {
	return [{
		"id": "TAB3530274439547263",
		"name": "index.test.js",
		"parent": "editor/tabs/components",
		"touched": false,
		"changed": false,
		"active": false
	}, {
		"id": "TAB9771111630135796",
		"name": "api.js",
		"parent": "editor/tabs/components",
		"touched": true,
		"changed": true
	}, {
		"id": "TAB16883093653295345",
		"name": "index.js",
		"parent": "editor/tabs/components",
		"touched": true,
		"changed": true,
		"active": false
	}, {
		"id": "TAB05546353718414654",
		"name": "api.test.js",
		"parent": "editor/tabs/components",
		"touched": true,
		"changed": true,
		"active": true
	}, {
		"name": "service-worker.utils.js",
		"parent": "test",
		"systemDocsName": "",
		"id": "TAB5625645608823764"
	}];
};

describe('editor tabs api', ({ beforeEach }) => {
	let api;

	beforeEach(() => {
		const operations = {
			removeTab: console.log
		};
		api = getApi({ operations });
	});

	it('should be the right api', (assert) => {
		const apiKeys = Object.keys(api);
		const expectApi = [
			'list',
			'find',
			'update',
			'push',
			'clearLast',
			'toUpdate'
		];
		expect(apiKeys.join('')).toEqual(expectApi.join(''));
	});

	it('should update and list tabs', (assert) => {
		const newTabs = mockTabs();
		api.update(newTabs);
		const tabs = api.list();
		expect(tabs.length).toEqual(newTabs.length);
	});

	it('should handle same name (different parent) files properly', (assert) => {
		const newTabs = mockTabs();
		api.update(newTabs);
		const { foundTab, tabsToUpdate } = api.toUpdate('api.js');

		expect(foundTab).toEqual(undefined);
		//previous active file is now inactive
		expect(tabsToUpdate.length).toEqual(1);
	});

	it('should handle same name files properly', (assert) => {
		const newTabs = mockTabs();
		api.update(newTabs);
		const filePath = 'editor/tabs/components/api.js';
		const { foundTab, tabsToUpdate } = api.toUpdate(filePath);

		expect(`${foundTab.parent}/${foundTab.name}`).toEqual(filePath);
		// previous active file is now inactive + activate foundTab = 2
		expect(tabsToUpdate.length).toEqual(2);
	});

});

if(self instanceof WorkerGlobalScope){
	let finish;
	const donePromise = new Promise((resolve) => { finish = resolve; });
	TestStart(finish);
	await donePromise;
}