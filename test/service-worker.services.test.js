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
	providers: {
		fileChange: () => {}
	},
	templates: {},
	ui: {
		id: 999,
		update: () => {}
	},
	utils,
};
const manager = new ServicesManager(deps);
const { serviceUpdate } = manager.handlers;

const params = {
	id: 3002
};
const body = {
	name: 'fake',
	operation: {
		name: 'moveFile',
		target: 'target/moved.xxx',
		source: 'source/toMove.xxx'
	},
};
const event = {
	request: {
		json: () => body
	}
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
deps.storage.stores.services.setItem = async (key) => {};
deps.storage.stores.files.keys = async (key) => {
	return [
		'fake/source/toMove.xxx',
		'fake/target/sibling.xxx',
		'fake/source/toStay.xxx',
	];
};
deps.storage.stores.files.setItem = async (key, value) => {
	console.log('file Set: '+key)
};
deps.storage.stores.files.getItem = async (key) => {
	console.log('file Get: '+key)
	return 'file content'
};
deps.storage.stores.changes.keys = async () => {
	return [
		'fake/changed.js',
		'fake/changed2.js',
		'another-service/changed.js'
	];
};
deps.storage.stores.changes.getItem = async (key) => {
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

console.log(JSON.stringify({ tree, code }, null, 2));

