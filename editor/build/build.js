
import 'rollup';
import 'rollupPluginSourceMap';
import 'terser';

import rollupConfig from './rollup.config.js';
import terserConfig from './terser.config.js';
import packageJson from "/package.json" assert { type: "json" };

const VERSION = `${packageJson.version}`;
const DATE = new Date().toISOString();

const AddVersion = (code) => code.replace(/{{VERSION}}/g, VERSION);
const AddDate = (code) => code.replace(/{{DATE}}/g, DATE);

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const Minify = (code) => Terser.minify(code, terserConfig());
//const Minify = (code) => ({ code });

const changeUrl = '/service/change';

function writeFile({ path, code }){
	const body = {
		path,
		service: 'crosshj/fiug-beta',
		//command: 'upsert',
		code
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
	return fetch(changeUrl, opts);
}

function saveBuild({ code, map }){
	const path = `./${rollupConfig.output.file}`;
	return writeFile({ path, code })
		.then(x => x.json());
}

async function copyFile(from, to){
	const code = await fetch(from).then(x => x.text());
	const path = to;
	return await writeFile({ path, code })
		.then(x => x.json());;
}

console.log(`fiug editor v${VERSION}`);
console.log(`rollup v${rollup.VERSION}`);
console.log(`bundling ...`);

const build = async () => {
	let error;
	try {
		const generated = await rollup.rollup(rollupConfig)
			.then(x => x.generate(rollupConfig.output));
		const { code } = generated.output[0];
		const minified = await pipe(AddDate,AddVersion,Minify)(code);
		let response = await saveBuild(minified);
		if(response.error) throw new Error(response.error);
		
		response = await copyFile(
			'/crosshj/fiug-beta/editor/editor.html',
			'./crosshj/fiug-beta/dist/editor.html'
		);
		if(response.error) throw new Error(response.error);

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
