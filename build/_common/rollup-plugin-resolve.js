import braces from './braces.js';
import {pather} from '../../shared/utilities.mjs';

const plugin = (root) => ({
	name: 'file resolver',

	resolveId ( source, importer ) {
		// if null is returned, handles usually
		// if source is returned, signals that rollup should not ask other plugins or check the file system to find this id
		let output = null;
		if(source.startsWith('https://')){
			output = source;
		}
		if(source.startsWith('./') || source.startsWith('../')){
			const parent = importer.split('/').slice(0, -1).join('/');
			output = pather(null, parent + '/' + source);
		}
		if(source.startsWith('/') && !importer){
			output = root + source;
		}
		if(source.startsWith('/') && importer){
			const [scheme, path] = importer.split('//');
			const origin = path.split('/').slice(0, 1);
			const parent = [scheme, origin].join('//');
			output = parent + source;
		}
		return output;
	},
	load: async ( id ) => {
		if(id.startsWith('https://')){
			return await fetch(id)
				.then(x => x.text())
		}
		return null; // other ids should be handled as usually
	}
});

export default plugin;
