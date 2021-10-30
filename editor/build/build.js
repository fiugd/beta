
import 'rollup';
import 'rollupPluginSourceMap';
import 'terser';

import rollupConfig from './rollup.config.js';
import terserConfig from './terser.config.js';
import packageJson from "/package.json" assert { type: "json" };

const VERSION = `v${packageJson.version}`;
const DATE = new Date().toISOString();

const AddVersion = (code) => code.replace(/{{VERSION}}/g, VERSION);
const AddDate = (code) => code.replace(/{{DATE}}/g, DATE);

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
//const Minify = (code) => Terser.minify(code, terserConfig());
const Minify = (code) => ({ code });

function saveBuild({ code, map }){
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
	return fetch(changeUrl, opts).then(x => x.json());
}
console.log(`rollup v${rollup.VERSION}`);
console.log(`bundling editor...`);

const build = async () => {
	let error;
	try {
		const generated = await rollup.rollup(rollupConfig)
			.then(x => x.generate(rollupConfig.output));
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
		`${self.location.origin}/${rollupConfig.output.file}`
		);
	}
};

await build();
