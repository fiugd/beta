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

	await files.setItem("~/.profile", `
# configure prompt here
# https://phoenixnap.com/kb/change-bash-prompt-linux
`.trim() +'\n');

	await files.setItem("~/welcome", `
Welcome to fiug!
TODO: make this better
`.trim() +'\n');

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
