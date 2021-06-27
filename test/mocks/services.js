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
	let body = {};
	const setBody = (b) => { body = b; };
	const getBody =() => body;
	const event = {
		request: {
			json: getBody
		}
	};
	const serviceFiles = {
		'./fake/source/toMove.xxx': 'file to move from source',
		'./fake/source/toRename.xxx': 'file to rename in source',
		'./fake/source/toDelete.xxx': 'file to delete from source',
		'./fake/source/toCopy.xxx': "a file to copy from source",
		'./fake/target/sibling.xxx': "a sibling file",
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
						"toRename.xxx": {},
						"toDelete.xxx": {},
						"toCopy.xxx": {},
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
			'providerFileChange': { ...changes[path], path },
		});
	};
	deps.storage.stores.services.getItem = async (key) => {
		calls.push({
			'servicesGet': { key }
		});
		return allServices[key]
	};
	deps.storage.stores.services.setItem = async (key, value) => {
		allServices[key] = value;
		calls.push({
			'serviceSet': { key, value }
		});
	};
	deps.storage.stores.files.keys = async () => {
		calls.push({
			'filesKeys': Object.keys(serviceFiles)
		});
		return Object.keys(serviceFiles);
	};
	deps.storage.stores.files.setItem = async (key, value) => {
		serviceFiles[key] = value;
		calls.push({
			'fileSet': { key, value }
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