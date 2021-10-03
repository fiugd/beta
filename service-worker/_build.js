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

import rollupConfig from '/crosshj/fiug-beta/service-worker/build/rollup.config.js';
import terserConfig from '/crosshj/fiug-beta/service-worker/build/terser.config.js';
import packageJson from "/package.json" assert { type: "json" };

const VERSION = `v${packageJson.version}`;
const DATE = new Date().toISOString();

const AddVersion = (code) => code.replace(/{{VERSION}}/g, VERSION);
const AddDate = (code) => code.replace(/{{DATE}}/g, DATE);

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const Minify = (code) => Terser.minify(code, terserConfig());

async function saveBuild({ code, map }){
	const changeUrl = '/service/change';
	const body = {
		path: `./${rollupConfig.output.file}`,
		service: 'crosshj/fiug-beta',
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

	try {
		return await fetch(changeUrl, opts).then(x => x.json());
	} catch(error) {
		return { error }; 
	}

	return { error: 'error saving build' };
}
console.log(`rollup v${rollup.VERSION}`);
console.log(`bundling service-worker...`);

const generated = await rollup.rollup(rollupConfig)
	.then(x => x.generate(rollupConfig.output));
const { code } = generated.output[0];

const minified = await pipe(AddDate,AddVersion,Minify)(code);
const {error} = await saveBuild(minified);

console.log(error || `DONE\nsee ` +
`${self.location.origin}/${rollupConfig.output.file}`
);
