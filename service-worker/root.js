import { settings } from './root.settings.js';
import { welcome } from './root.welcome.js';
import { profile } from './root.profile.js';

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
			'welcome.md': {}
		}},
	};
	await services.setItem('0', service);

	await files.setItem("~/.git/config", '\n');
	await files.setItem("~/settings.json", settings());
	await files.setItem("~/.profile", profile());
	await files.setItem("~/welcome.md", welcome());

	await changes.setItem(`state-${service.name}-opened`, [
		{ name: 'welcome.md', order: 0 }
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
