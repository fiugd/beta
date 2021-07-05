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

describe('update service', ({ beforeEach }) => {
	const newServiceName = 'fake/foo';

	beforeEach(() => {
		mock = ServiceMock({ utils });
		manager = new ServicesManager(mock.deps);
		mock.setService(3002, (svc) => {
			svc.tree[newServiceName] = svc.tree.fake;
			delete svc.tree.fake;
			svc.name = newServiceName;
			svc.repo = newServiceName;
			return svc;
		});
		mock.setFiles((files) => {
			Object.entries(files)
				.forEach(([k,v]) => {
					delete files[k];
					files[k.replace('/fake/', `/${newServiceName}/`)] = v;
				});
		})
	});

	it('should add file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
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
		assert.custom(errors);

		const sourceFileAdded = mock.calls
			.find(({ fileSet={} }) => fileSet.key === `./${newServiceName}/target/addedFile.xxx`);
		expect(sourceFileAdded).toBeTruthy();

		const addFileChange = mock.changes[`${newServiceName}/target/addedFile.xxx`] || {};
		expect(!addFileChange.deleteFile).toBeTruthy();

		const resultShowsFileAdded = safe(() => result.result[0].tree[newServiceName].target['addedFile.xxx']);
		expect(resultShowsFileAdded).toBeTruthy();
	});
	it('should delete file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
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
			.find(({ fileSet={} }) => fileSet.key === `./${newServiceName}/source/toDelete.xxx`);
		expect(sourceFileRemoved === undefined, 'source file removed').toBeTruthy();

		const deleteFileChange = mock.changes[`${newServiceName}/source/toDelete.xxx`] || {};
		expect(deleteFileChange.deleteFile, 'deleted file change').toBeTruthy();

		const resultShowsFileDelete = safe(() => result.result[0].tree[newServiceName].source['toDelete.xxx']) || 'does not exist';
		expect(resultShowsFileDelete === 'does not exist', 'deleted file').toBeTruthy();
	});
	it('should copy file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
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
			.find(({ fileSet={} }) => fileSet.key === `./${newServiceName}/target/toCopyCopied.xxx`);
		expect(sourceFileAdded).toBeTruthy();

		const copyFileAdd = mock.changes[`${newServiceName}/target/toCopyCopied.xxx`] || {};
		expect(!copyFileAdd.deleteFile).toBeTruthy();
		
		const copyFileRemove = mock.changes[`${newServiceName}/target/toCopy.xxx`];
		expect(!copyFileRemove).toBeTruthy();
	});
	it('should move file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
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
			.find(({ fileRemove={} }) => fileRemove.key === `./${newServiceName}/source/toMove.xxx`);
		expect(sourceFileRemoved, 'source file removed').toBeTruthy();

		const deleteFileChange = mock.changes[`${newServiceName}/source/toMove.xxx`];
		expect(deleteFileChange && deleteFileChange.deleteFile, `delete file change`).toBeTruthy();

		const addFileChange = mock.changes[`${newServiceName}/target/toMove.xxx`];
		expect(addFileChange && !addFileChange.deleteFile, `add file change`).toBeTruthy();
	});
	it('should rename file', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
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

		const renameFilePath = `./${newServiceName}/source/toRename.xxx`;
		const sourceFileRemoved = mock.calls.find(x => x.fileRemove?.key === renameFilePath);
		expect(sourceFileRemoved).toBeTruthy();

		const deleteFileChange = mock.changes[`${newServiceName}/source/toRename.xxx`];
		expect(deleteFileChange && deleteFileChange.deleteFile, `delete file change`).toBeTruthy();

		const addFileChange = mock.changes[`${newServiceName}/target/toRename.xxx`];
		expect(addFileChange && !addFileChange.deleteFile, `add file change`).toBeTruthy();
	});

	it('should add folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'addFolder',
				target: 'target/newFolder',
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		expect(tree.target.newFolder).toBeTruthy();
	});
	it('should delete folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'deleteFolder',
				source: 'target',
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		const files = safe(() => result.result[0].code);
		const deletedChildren = files.filter(x => x.path.startsWith(`/${newServiceName}/target/`));

		const deleteFileChange = mock.changes[newServiceName + '/target/sibling.xxx'] || {};
		expect(deleteFileChange,'deleteFileChange').toBeTruthy();
		expect(deleteFileChange.deleteFile,'change.deleteFile').toBeTruthy();

		expect(!tree.target, 'deleted target in tree').toBeTruthy();
		expect(deletedChildren.length, 'deleted children files length').toEqual(0);
	});
	it('should copy folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'copyFolder',
				source: 'source',
				target: 'target'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		const files = safe(() => result.result[0].code);

		const copiedSourceFiles = files.filter(x => x.path.startsWith(`/${newServiceName}/source/`));
		const copiedTargetFiles = files.filter(x => x.path.startsWith(`/${newServiceName}/target/source/`));
		assert.deepEqual(
			Object.keys(copiedSourceFiles).sort(),
			Object.keys(copiedTargetFiles).sort()
		);
		assert.deepEqual(
			Object.keys(tree.target.source).sort(),
			Object.keys(tree.source).sort()
		);
	});
	it('should move folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		console.log(`./${newServiceName}/source/`)
		const originalSourceFileLength = Object.keys(mock.files)
			.filter(x => x.startsWith(`./${newServiceName}/source/`))
			.filter(x => !x.includes('.keep'))
			.length;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'moveFolder',
				source: 'source',
				target: 'target'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		const files = safe(() => result.result[0].code);
		const sourceFiles = files.filter(x => x.path.startsWith(`/${newServiceName}/source/`));
		const movedFiles = files.filter(x => x.path.startsWith(`/${newServiceName}/target/source/`));

		expect(tree.source, 'source folder in tree').toEqual(undefined);
		expect(tree.target.source, 'source folder in target in tree').toBeTruthy();
		
		expect(sourceFiles.length, 'source files length').toEqual(0);
		expect(movedFiles.length, 'moved files length').toEqual(originalSourceFileLength);
	});
	it('should rename folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		const originalSourceFileLength = Object.keys(mock.files)
			.filter(x => x.startsWith(`./${newServiceName}/source/`))
			.filter(x => !x.includes('.keep'))
			.length;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'renameFolder',
				source: 'source',
				target: 'sourceRenamed'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		const files = safe(() => result.result[0].code);
		const sourceFiles = files.filter(x => x.path.startsWith(`/${newServiceName}/source/`));
		const childFiles = files.filter(x => x.path.startsWith(`/${newServiceName}/sourceRenamed/`));

		expect(tree.source, 'source folder in tree').toEqual(undefined);
		expect(tree.sourceRenamed, 'source renamed folder in tree').toBeTruthy();

		expect(sourceFiles.length, 'source files length').toEqual(0);
		expect(childFiles.length, 'renamed child files length').toEqual(originalSourceFileLength);
	});

	it('should create .keep file for empty folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'deleteFile',
				source: 'target/sibling.xxx'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		const files = safe(() => result.result[0].code);

		const keepFile = files.find(x => x.path === `/${newServiceName}/target/.keep`);
		expect(keepFile).toBeTruthy();
		expect(tree.target['.keep']).toBeTruthy();
		expect(mock.changes[newServiceName+'/target/.keep'], "keep file changes").toBeTruthy();
	});
	it('should remove .keep file for filled folder', async (assert) => {
		const { serviceUpdate } = manager.handlers;
		mock.setBody({
			name: newServiceName,
			operation: {
				name: 'addFile',
				target: 'target/.keep'
			},
		});
		const errors = [];
		let result;
		try {
			result = await serviceUpdate(mock.params, mock.event);
			result = JSON.parse(result);
			if(result.error) errors.push(result.error);
		} catch({ message, stack }){
			errors.push({ message, stack });
		}
		assert.custom(errors);

		const tree = safe(() => result.result[0].tree[newServiceName]);
		const files = safe(() => result.result[0].code);

		const addedKeepFile = files.find(x => x.path === `/${newServiceName}/target/.keep`)
		expect(addedKeepFile).toEqual(undefined);
		expect(tree.target['.keep']).toEqual(undefined);
		expect(mock.changes[newServiceName+'/target/.keep'], "added keep file changes").toEqual(undefined);

		const preExistingKeepFile = files.find(x => x.path === `/${newServiceName}/source/.keep`);
		expect(preExistingKeepFile).toEqual(undefined);
		expect(tree.source['.keep']).toEqual(undefined);
		expect(mock.changes[newServiceName+'/source/.keep'].deleteFile, 'delete pre-existing keep file').toBeTruthy();
	});

});

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