//import { argv } from 'https://beta.fiug.dev/process.js';
//console.log(argv.join('\n') + '\n');


import 'rollup';
import 'rollupPluginSourceMap';
import 'terser';

import terserConfig from './_common/terser.config.js';
import packageJson from "/package.json" assert { type: "json" };

const VERSION = `${packageJson.version}`;
const DATE = new Date().toISOString();

const AddVersion = (code) => code.replace(/{{VERSION}}/g, VERSION);
const AddDate = (code) => code.replace(/{{DATE}}/g, DATE);

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const Minify = (code) => Terser.minify(code, terserConfig());
//const Minify = (code) => ({ code });

const changeUrl = '/service/change';
const root = 'fiugd/beta';

const writeFile = async ({ path, code }) => {
	const body = {
		path,
		service: root,
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
	debugger
	const response = await fetch(changeUrl, opts);
	debugger
	let parsed;
	try {
		parsed = await response.json();
	} catch (e) {}

	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return parsed;
}

const copyFile = async (from, to) => {
	const code = await fetch(from).then(x => x.text());
	const path = to;
	return await writeFile({ path, code });
};

const saveBuild =  (config) => async (args) => {
	const { code, map } = await args;
	const path =  `./${config.output.file}`;
	const response = await writeFile({ path, code });

	return response;
};

const build = async (configUrl) => {
	let error;

	const rollupConfig = (await import(configUrl)).default;
	const {
		componentName,
		copyFiles=[],
		...config
	} = rollupConfig(root);

	console.log(`\n${componentName} v${VERSION}`);
	console.log(`rollup v${rollup.VERSION}`);
	console.log(`\nbundling ...`);

	try {
		const generated = await rollup.rollup(config)
			.then(x => x.generate(config.output));
		const { code } = generated.output[0];
		const response = await pipe(
			AddDate,
			AddVersion,
			Minify,
			saveBuild(config)
		)(code);

		for(let { from, to } of copyFiles){
			response = await copyFile(from, to);
			if(response.error) throw new Error(response.error);
		}
	} catch (e){
		error = e.message + '\n' + e.stack;
	}

	if(error){
		console.log('\n' + error);
	} else {
		console.log('NOTE: analysis does not include terser effects\n')
		console.log(`\nOUTPUT: ` +
		`${self.location.origin}/${config.output.file}`
		);
	}

};

export default build;
