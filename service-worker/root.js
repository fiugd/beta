import { bsConfig } from './root/.browsersync.js';
import { editorconfig } from './root/.editorconfig.js';
import { profile } from './root/.profile.js';
import { importmap } from './root/importmap.json.js';
import { jestConfig } from './root/jest.config.js';
import { settings } from './root/settings.json.js';
import { tsconfig } from './root/tsconfig.json.js';
import { welcome } from './root/welcome.md.js';

const initRootService = async ({ stores }) => {
	const {services, files, changes} = stores;
	const service = {
		name: '~',
		id: 0,
		type: 'default',
		tree: { '~': {
			'.git': { config: {} },
			'.browsersync.js': {},
			'.editorconfig': {},
			'.profile': {},
			'importmap.json': {},
			'jest.config.js': {},
			'settings.json': {},
			'tsconfig.json': {},
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
		["~/.browsersync.js", bsConfig()],
		["~/.editorconfig", editorconfig()],
		["~/.profile", profile()],
		["~/importmap.json", importmap()],
		['~/jest.config.js', jestConfig()],
		["~/settings.json", settings()],
		["~/tsconfig.json", tsconfig()],
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
