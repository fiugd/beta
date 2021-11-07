/*

NOTES from initial go at this:

would like to bundle the service worker into one file and not have to use bastardized module.exports/require

*** rollup:
http://rollupjs.org/repl/
https://github.com/rollup/rollup/blob/master/docs/999-big-list-of-options.md
https://github.com/rollup/rollup/blob/master/docs/05-plugin-development.md
https://rollupjs.org/guide/en/#outputformat
https://rollupjs.org/guide/en/#rolluprollup

parcel:
https://parcel-repl.vercel.app/
from https://github.com/parcel-bundler/parcel/issues/1253

other:
https://skalman.github.io/UglifyJS-online/
https://try.terser.org/

*/

import 'rollup';
import 'rollupPluginSourceMap';
import 'terser';

import rollupConfig from './rollup.config.js';
import terserConfig from '../_common/terser.config.js';
import packageJson from "/package.json" assert { type: "json" };

const VERSION = `v${packageJson.version}`;
const DATE = new Date().toISOString();

const AddVersion = (code) => code.replace(/{{VERSION}}/g, VERSION);
const AddDate = (code) => code.replace(/{{DATE}}/g, DATE);

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const Minify = (code) => Terser.minify(code, terserConfig());

const changeUrl = '/service/change';
const root = 'fiugd/beta';
const config = rollupConfig(root);

function saveBuild({ code, map }){
	const body = {
		path: `./${config.output.file}`,
		service: root,
		//command: 'upsert',
		code: code
	};
	const headers = {
		"accept": "application/json",
		"content-type": "application/json",
	};
	const opts = { 
			method: 'POST',
			headers,
			body: JSON.stringify(body),
			mode: "cors",
			credentials: "omit"
	};
	return fetch(changeUrl, opts).then(x => x.json());
}
console.log(`rollup v${rollup.VERSION}`);
console.log(`bundling service-worker...`);

const build = async () => {
	let error;
	try {
		const generated = await rollup.rollup(config)
			.then(x => x.generate(config.output));
		const { code } = generated.output[0];
		const minified = await pipe(AddDate,AddVersion,Minify)(code);
		const response = await saveBuild(minified);
		if(response.error){
			error = response.error
		}
	} catch (e){
		error = e.message + '\n' + e.stack;
	}

	if(error){
		console.log('\n' + error);
	} else {
		console.log(`DONE\nsee ` +
		`${self.location.origin}/${config.output.file}`
		);
	}
};

await build();