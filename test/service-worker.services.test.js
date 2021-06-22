const safe = (fn) => {
	try {
		return fn();
	} catch (e) {
		console.error("possible issue: " + fn.toString());
		return;
	}
};


self.module = { exports: {} };
(async () => {

	await import(cwd+'/../modules/service-worker.services.js');
	const { ServicesManager } = module.exports;


	//await import(cwd+'/../modules/service-worker.utils.js');
	// const utils = module.exports;
	// console.log(utils);

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
		ui: { update: () => {} },
		utils: { safe },
	};
	const manager = new ServicesManager(deps);
	const { serviceUpdate } = manager.handlers;
	const params = {
		id: 3002
	};
	const body = {
		name: '',
		operation: { name: 'moveFile' }
	};
	const event = {
		request: {
			json: () => body
		}
	};

	deps.storage.stores.services.getItem = async () => {
		return {};
	};
	deps.storage.stores.files.keys = async () => {
		return ['woo'];
	};
	const result = await serviceUpdate(params, event);

	console.log(result);
})();
