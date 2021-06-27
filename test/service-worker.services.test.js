import testlib from "./testlib.js";
import { ServiceMock } from "./mocks/services.js";
const { describe, it, start: TestStart, expect, logJSON, safe } = testlib;

// tricking ugly module pattern into an import
self.module = { exports: {} };
await import(cwd+'/../modules/service-worker.services.js');
const { ServicesManager } = module.exports;
await import(cwd+'/../modules/service-worker.utils.js');
const utils = module.exports;

let mock;
let manager;

describe('create service', ({ beforeEach }) => {
	beforeEach(() => {
		mock = ServiceMock({ utils });
		manager = new ServicesManager(mock.deps);
	});

	it.todo('should use provider when indicated', async (assert) => {});
	it.todo('should register service handler', async (assert) => {});
	it.todo('should deliver default service', async (assert) => {});
});

describe('change service', ({ beforeEach }) => {
	beforeEach(() => {
		mock = ServiceMock({ utils });
		manager = new ServicesManager(mock.deps);
	});

	it.todo('should save changes to files within service', async (assert) => {});
	it.todo('should use provider when applicable', async (assert) => {});
	it.todo('should trigger template update when necessary', async (assert) => {});
	it.todo('should indicate type of change', async (assert) => {});

	it.todo('should be doing things that update service is doing?', async (assert) => {});

	it.todo('should return a list of current changes', async (assert) => {});
});

describe('update service', ({ beforeEach }) => {
	beforeEach(() => {
		mock = ServiceMock({ utils });
		manager = new ServicesManager(mock.deps);
	});

	it('should move file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: 'fake',
			operation: {
				name: 'moveFile',
				target: 'target/', 
				source: 'source/toMove.xxx'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error){
				errors.push({
					message: result.error.message,
					stack: result.error.stack
				});
			}
		} catch(e){
			errors.push(e);
		}
		errors.length && assert.custom(errors);

		const sourceFileRemoved = mock.calls
			.find(({ fileRemove={} }) => fileRemove.key === "./fake/source/toMove.xxx");
		expect(sourceFileRemoved).toBeTruthy();

		const deleteFileChange = mock.changes['fake/source/toMove.xxx'];
		expect(deleteFileChange.deleteFile).toBeTruthy();

		assert.deepEqual([
			'fake/source/toMove.xxx',
			'fake/target/toMove.xxx',
			"tree-fake-expanded",
			"state-fake-opened"
			].sort(),
			Object.keys(mock.changes).sort()
		);
	});
	it('should rename file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: 'fake',
			operation: {
				name: 'renameFile',
				target: 'target/toRename.xxx',
				source: 'source/toRename.xxx'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch(e){
			const { message, stack } = e;
			errors.push({ message, stack });
		}
		errors.length && assert.custom(errors);

		const sourceFileRemoved = mock.calls.find(x => x.fileRemove?.key === "./fake/source/toRename.xxx");
		expect(sourceFileRemoved).toBeTruthy();
		assert.deepEqual([
			'fake/source/toRename.xxx',
			'fake/target/toRename.xxx',
			"tree-fake-expanded",
			"state-fake-opened"
			].sort(),
			Object.keys(mock.changes).sort()
		);
		expect(mock.changes['fake/source/toRename.xxx']?.deleteFile).toBeTruthy();
	});
	it('should copy file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: 'fake',
			operation: {
				name: 'copyFile',
				target: 'target/toCopyCopied.xxx',
				source: 'source/toCopy.xxx'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error){
				errors.push({
					message: result.error.message,
					stack: result.error.stack
				});
			}
		} catch(e){
			const { message, stack } = e;
			errors.push({ message, stack });
		}
		errors.length && assert.custom(errors);

		const sourceFileAdded = mock.calls
			.find(({ fileSet={} }) => fileSet.key === "./fake/target/toCopyCopied.xxx");
		expect(sourceFileAdded).toBeTruthy();

		const copyFileAdd = mock.changes['fake/target/toCopyCopied.xxx'] || {};
		expect(!copyFileAdd.deleteFile).toBeTruthy();
		
		const copyFileRemove = mock.changes['fake/target/toCopy.xxx'];
		expect(!copyFileRemove).toBeTruthy();
	});
	it('should add new file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: 'fake',
			operation: {
				name: 'addFile',
				target: 'target/addedFile.xxx',
				source: 'this file was added'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error){
				errors.push({
					message: result.error.message,
					stack: result.error.stack
				});
			}
		} catch(e){
			const { message, stack } = e;
			errors.push({ message, stack });
		}

		errors.length && assert.custom(errors);

		const sourceFileAdded = mock.calls
			.find(({ fileSet={} }) => fileSet.key === "./fake/target/addedFile.xxx");
		expect(sourceFileAdded).toBeTruthy();

		const addFileChange = mock.changes['fake/target/addedFile.xxx'] || {};
		expect(!addFileChange.deleteFile).toBeTruthy();

		const resultShowsFileAdded = safe(() => result.result[0].tree.fake.target['addedFile.xxx']);
		expect(resultShowsFileAdded).toBeTruthy();
	});
	it('should delete file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: 'fake',
			operation: {
				name: 'deleteFile',
				source: 'source/toDelete.xxx'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error){
				errors.push({
					message: result.error.message,
					stack: result.error.stack
				});
			}
		} catch(e){
			const { message, stack } = e;
			errors.push({ message, stack });
		}

		errors.length && assert.custom(errors);

		const sourceFileRemoved = mock.calls
			.find(({ fileSet={} }) => fileSet.key === "./fake/source/toDelete.xxx");
		expect(sourceFileRemoved === undefined).toBeTruthy();

		const deleteFileChange = mock.changes['fake/source/toDelete.xxx'] || {};
		expect(deleteFileChange.deleteFile).toBeTruthy();

		const resultShowsFileDelete = safe(() => result.result[0].tree.fake.source['toDelete.xxx']) || 'does not exist';
		expect(resultShowsFileDelete === 'does not exist').toBeTruthy();
	});

	it.todo('should move folder', async (assert) => {});
	it.todo('should rename folder', async (assert) => {});
	it.todo('should copy folder', async (assert) => {});
	it.todo('should add new folder', async (assert) => {});
	it.todo('should delete folder', async (assert) => {});
});

describe('delete service', ({ beforeEach }) => {
	beforeEach(() => {
		mock = ServiceMock({ utils });
		manager = new ServicesManager(mock.deps);
	});

	it.todo('should delete a service', async (assert) => {});
	it.todo('should remove files when service is deleted', async (assert) => {});
});

/*
describe('test examples', () => {
	it('example of passing test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 2);
	});
	it.skip('example of skipped test', (assert) => {
	});
	it('example of failing test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 4, `expected ${add(1,1)} to equal 4`);
	});
	it.todo('example of todo test', (assert) => {
	});
});
*/

//TestStart();

let finish;
const donePromise = new Promise((resolve) => { finish = resolve; });
TestStart(finish);
await donePromise;
