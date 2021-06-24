import testlib from "./testlib.js";
import { ServiceMock } from "./mocks/services.js";
const { describe, it, start: TestStart, expect } = testlib;

// tricking ugly module pattern into an import
self.module = { exports: {} };
await import(cwd+'/../modules/service-worker.services.js');
const { ServicesManager } = module.exports;
await import(cwd+'/../modules/service-worker.utils.js');
const utils = module.exports;

describe('create service', () => {
	it.todo('should use provider when indicated', (assert) => {});
	it.todo('should register service handler', (assert) => {});
	it.todo('should deliver default service', (assert) => {});
});

describe('change service', () => {
	it.todo('should save changes to files within service', (assert) => {});
	it.todo('should use provider when applicable', (assert) => {});
	it.todo('should trigger template update when necessary', (assert) => {});
	it.todo('should indicate type of change', (assert) => {});

	it.todo('should be doing things that update service is doing?', (assert) => {});

	it.todo('should return a list of current changes', (assert) => {});
});

describe('update service', ({ beforeEach }) => {
	let mock;
	let manager;

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
			if(result.error) throw new Error(result.error);
			const { result: [{ tree, code }] } = result;
		} catch(e){
			const { message, stack } = e;
			errors.push({ message, stack: stack.split('\n') });
		}
		//console.log(JSON.stringify({ tree, code },null,2));
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
				name: 'moveFile',
				target: 'target/toRename.xxx',
				source: 'source/toMove.xxx'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) throw new Error(result.error);
			const { result: [{ tree, code }] } = result;
		} catch(e){
			const { message, stack } = e;
			errors.push({ message, stack: stack.split('\n') });
		}
		errors.length && assert.custom(errors);
		const sourceFileRemoved = mock.calls.find(x => x.fileRemove?.key === "./fake/source/toMove.xxx");
		assert.ok(!!sourceFileRemoved);
		assert.deepEqual([
			'fake/source/toMove.xxx',
			'fake/target/toRename.xxx',
			"tree-fake-expanded",
			"state-fake-opened"
			].sort(),
			Object.keys(mock.changes).sort()
		);
		assert.ok(mock.changes['fake/source/toMove.xxx']?.deleteFile)
	});
	it.todo('should copy file', (assert) => {});
	it.todo('should add new file', (assert) => {});
	it.todo('should delete file', (assert) => {});

	it.todo('should move folder', (assert) => {});
	it.todo('should rename folder', (assert) => {});
	it.todo('should copy folder', (assert) => {});
	it.todo('should add new folder', (assert) => {});
	it.todo('should delete folder', (assert) => {});
});

describe('delete service', () => {
	it.todo('should delete a service', (assert) => {});
	it.todo('should remove files when service is deleted', (assert) => {});
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
