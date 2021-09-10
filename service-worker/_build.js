/*

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

import config  from './rollup.config.js';

import 'https://unpkg.com/rollup/dist/rollup.browser.js';

import packageJson from "https://beta.fiug.dev/crosshj/fiug-beta/package.json" assert { type: "json" };
const VERSION = `v${packageJson.version}-${new Date().toISOString()}`;
const AddVersion = (code) => code.replace(/{{VERSION}}/g, VERSION);

async function saveBuild(buildOutput){
	const changeUrl = 'https://beta.fiug.dev/service/change';
	const body = {
		path: `./${config.output.file}`,
		service: 'crosshj/fiug-beta',
		//command: 'upsert',
		code: buildOutput
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
	//console.log(JSON.stringify(opts, null, 2))
	try {
		return await fetch(changeUrl, opts).then(x => x.json());
	} catch(error) {
		return { error }; 
	}

	return { error: 'error saving build' };
}

console.log(`Bundling service-worker with Rollup version ${rollup.VERSION}...`);

const generated = await rollup.rollup(config)
	.then(x => x.generate(config.output));
const { code } = generated.output[0];


const {error} = await saveBuild(AddVersion(code));
console.log(error || `DONE\nsee ` +
`https://beta.fiug.dev/${config.output.file}`
);
