import testlib from "./testlib.js";
import { ServiceMock } from "./mocks/services.js";
const { describe, it, start: TestStart } = testlib;

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

	it('should move file to target path', async (assert) => {
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
		//errors.length && console.log(JSON.stringify(errors, null, 2));
		//console.log(JSON.stringify({ tree, code },null,2));
		//console.log(JSON.stringify(mock.changes, null, 2));
		//console.log(JSON.stringify(mock.calls, null, 2));
		const sourceFileRemoved = mock.calls.find(x => x.fileRemove?.key === "./fake/source/toMove.xxx");
		assert.ok(!!sourceFileRemoved);
		assert.deepEqual([
			'fake/source/toMove.xxx',
			'fake/target/toMove.xxx',
			"tree-fake-expanded",
			"state-fake-opened"
			].sort(),
			Object.keys(mock.changes).sort()
		);
		assert.ok(mock.changes['fake/source/toMove.xxx']?.deleteFile)
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

	it.todo('should move folder to target path', (assert) => {});
	it.todo('should rename file to target path', (assert) => {});
	it.todo('should add files from update', (assert) => {});
	it.todo('should delete files from update', (assert) => {});
});

describe('delete service', () => {
	it.todo('should remove a service', (assert) => {});
});


describe('test examples', () => {
	it('example of passing test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 2);
	});
	it.skip('example of skipped test', (assert) => {
	});
	it('example of failing test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 4);
	});
	it.todo('example of todo test', (assert) => {
	});
	it.todo('example of async test', (assert) => {
		const done = assert.async();
		setTimeout(done, 1000);
	});
});

let finish;
const donePromise = new Promise((resolve) => { finish = resolve; });
TestStart(finish);
await donePromise;
