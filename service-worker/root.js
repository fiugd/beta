const initRootService = async ({ stores }) => {
	const {services, files, changes} = stores;
	const service = {
		name: '~',
		id: 0,
		type: 'default',
		tree: { '~': {
			'.git': { config: {} },
			'.profile': {},
			'settings.json': {},
			'welcome': {}
		}},
	};
	await services.setItem('0', service);
	await files.setItem("~/.git/config", '\n');
	await files.setItem("~/settings.json", '{}');
	await files.setItem("~/.profile", '\n#configure prompt here');
	await files.setItem("~/welcome", 'welcome to fiug\ntodo: make this better\n');

	await changes.setItem(`state-${service.name}-opened`, [
		{ name: 'welcome', order: 0 }
	]);

	return service;
};

class RootService {
	constructor(stores){
		this.stores = stores;
		this.init = () => initRootService(this);
	}
}

export { RootService };
