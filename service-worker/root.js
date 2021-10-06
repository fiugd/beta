import { editorconfig } from './root/.editorconfig.js';
import { profile } from './root/.profile.js';
import { importmap } from './root/importmap.json.js';
import { settings } from './root/settings.json.js';
import { welcome } from './root/welcome.md.js';

const initRootService = async ({ stores }) => {
	const {services, files, changes} = stores;
	const service = {
		name: '~',
		id: 0,
		type: 'default',
		tree: { '~': {
			'.git': { config: {} },
			'.editorconfig': {},
			'.profile': {},
			'importmap.json': {},
			'settings.json': {},
			'welcome.md': {},
		}},
	};
	await services.setItem('0', service);

	const getFile = async (filePath) => {
		const value = (await changes.getItem(filePath) || {}).value ||
			await files.getItem(filePath);
		try {
			return JSON5.parse(value);
		} catch(e){}
		return value;
	};

	const rootFiles = [
		["~/.git/config", '\n'],
		["~/.profile", profile()],
		["~/.editorconfig", editorconfig()],
		["~/importmap.json", importmap()],
		["~/settings.json", settings()],
		["~/welcome.md", welcome()],
	];

	for(let i=0, len=rootFiles.length; i<len; i++){
		const [path, defaultContent] = rootFiles[i];
		const existingContent = await getFile(path);
		if(existingContent) continue;
		await files.setItem(path, defaultContent);
	}

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
