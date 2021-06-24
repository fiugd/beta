export const ServiceMock = ({ utils }) => {
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
	const calls = [];
	const params = {
		id: 3002
	};
	let body = {
		name: 'fake',
		operation: {
			name: 'moveFile',
			target: 'target/', 
			source: 'source/toMove.xxx'
		},
	};
	const setBody = (b) => body = b;
	const event = {
		request: {
			json: () => body
		}
	};
	const serviceFiles = {
		'./fake/source/toMove.xxx': 'file to move',
		'./fake/target/sibling.xxx': "a sibling file",
		'./fake/source/toStay.xxx': "a file that should stay",
	};
	const allServices = {
		"3002": {
			id: 3002,
			name: 'fake',
			type: 'github',
			repo: 'fake',
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
		}
	};
	const changes = {
		'tree-fake-expanded': [ 'expanded/1', 'expanded/2' ],
		'state-fake-opened': [{ name: 'opened.js', order: 0 }]
	};

	deps.providers.fileChange = async (args) => {
		//console.log(JSON.stringify(args, null, 2));
		const { path:originalPath, parent, code, deleteFile } = args;
		const path = originalPath.slice(2);
		changes[path] = {
			value: code, deleteFile, service: parent
		}; 
		calls.push({
			'provider file change': { ...changes[path], path },
		});
	};
	deps.storage.stores.services.getItem = async (key) => {
		calls.push({
			'services get': { key }
		});
		return allServices[key]
	};
	deps.storage.stores.services.setItem = async (key, value) => {
		allServices[key] = value;
		calls.push({
			'service Set': { key, value }
		});
	};
	deps.storage.stores.files.keys = async () => {
		calls.push({
			'files keys': {}
		});
		return Object.keys(serviceFiles);
	};
	deps.storage.stores.files.setItem = async (key, value) => {
		serviceFiles[key] = value;
		calls.push({
			'file Set': { key, value }
		});
	};
	deps.storage.stores.files.getItem = async (key) => {
		const value = serviceFiles[key];
		calls.push({
			fileGet: { key, value }
		});
		return value;
	};
	deps.storage.stores.files.removeItem = async (key) => {
		delete serviceFiles[key];
		calls.push({
			fileRemove: { key }
		});
	};

	deps.storage.stores.changes.keys = async () => {
		calls.push({
			changesKeys: Object.keys(changes) 
		});
		return Object.keys(changes);
	};
	deps.storage.stores.changes.getItem = async (key) => {
		calls.push({
			changesGet: { key }
		});
		return changes[key];
	};

	return {
		deps, setBody, event, calls, params, changes
	};
}