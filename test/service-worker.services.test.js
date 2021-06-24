import testlib from "./testlib.js";
const { describe, it, start: TestStart } = testlib;

self.module = { exports: {} };

await import(cwd+'/../modules/service-worker.services.js');
const { ServicesManager } = module.exports;
await import(cwd+'/../modules/service-worker.utils.js');
const utils = module.exports;

const deps = {
	app: {},
	storage: {
		stores: {
			services: {},
			files: {},
			changes: {},
		}
	},
	providers: {},
	templates: {},
	ui: {
		id: 999,
		update: () => {}
	},
	utils,
};
const manager = new ServicesManager(deps);
const { serviceUpdate } = manager.handlers;

const calls = [];

const params = {
	id: 3002
};
const body = {
	name: 'fake',
	operation: {
		name: 'moveFile',
		target: 'target/', 
		source: 'source/toMove.xxx'
	},
};
const event = {
	request: {
		json: () => body
	}
};

deps.providers.fileChange = async ({ path, code, deleteFile }) => {
	calls.push({
		'provider file change': JSON.stringify({ path, code, deleteFile }, null, 2)
	});
};

deps.storage.stores.services.getItem = async () => ({
	name: 'fake',
	tree: {
		fake: {
			target: {
				'sibling.xxx': {}
			},
			source: {
				"toMove.xxx": {},
				"toStay.xxx": {},
			}
		}
	}
});
deps.storage.stores.services.setItem = async (key, value) => {
	calls.push({
		'service Set': { key, value }
	});
};
deps.storage.stores.files.keys = async (key) => {
	return [
		'fake/source/toMove.xxx',
		'fake/target/sibling.xxx',
		'fake/source/toStay.xxx',
	];
};
deps.storage.stores.files.setItem = async (key, value) => {
	calls.push({
		'file Set': { key, value }
	});
};
deps.storage.stores.files.getItem = async (key) => {
	calls.push({
		'file Get': { key }
	});
	return 'file content: ' + key
};
deps.storage.stores.files.removeItem = async (key) => {
	calls.push({
		'file Remove': { key }
	});
};
deps.storage.stores.changes.keys = async () => {
	return [
		'fake/changed.js',
		'fake/changed2.js',
		'another-service/changed.js'
	];
};
deps.storage.stores.changes.getItem = async (key) => {
	calls.push({
		'changes Get': { key }
	});
	if(key.includes('-expanded')) return [
		'expanded/1', 'expanded/2'
	];
	if(key.includes('-opened')) return [{
		name: 'opened.js',
		order: 0
	}];
	return ['woo'];
};


const result = await serviceUpdate(params, event);
const { result: [{ tree, code }] } = JSON.parse(result);
calls.push({
	'results': { tree, code }
});

console.log('\x1bc'); // clear screen

describe('create service', () => {
	it.skip('should use provider when indicated', (assert) => {});
	it.skip('should register service handler', (assert) => {});
	it.skip('should deliver default service', (assert) => {});
});

describe('change service', () => {
	it.skip('should save changes to files within service', (assert) => {});
	it.skip('should use provider when applicable', (assert) => {});
	it.skip('should trigger template update when necessary', (assert) => {});
	it.skip('should indicate type of change', (assert) => {});

	it.skip('should be doing things that update service is doing?', (assert) => {});
});

describe('get service changes', () => {
	it.skip('should return a list of current changes', (assert) => {});
});

describe('update service', () => {
	it.skip('should move file to target path', (assert) => {});
	it.skip('should move file to target path with file name', (assert) => {});
	it.skip('should move folder to target path', (assert) => {});
	it.skip('should rename file to target path', (assert) => {});
	it.skip('should add files from update', (assert) => {});
	it.skip('should delete files from update', (assert) => {});
});

describe('delete service', () => {
	it.skip('should remove a service', (assert) => {});
});

describe('test examples', () => {
	it('example of passing test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 2);
	});
	it.skip('example of skipped test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 2);
	});
	it('example of failing test', (assert) => {
		const add = (one,two) => one+two;
		assert.equal(add(1, 1), 4);
	});
});

TestStart();
