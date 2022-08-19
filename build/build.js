//import { argv } from 'https://beta.fiug.dev/process.js';
//console.log(argv.join('\n') + '\n');


import 'rollup';
import 'rollupPluginSourceMap';
import 'terser';

import terserConfig from './_common/terser.config.js';
import getAnalyzeConfig from './_common/analyze.config.js';
import getOnWarn from './_common/warn.config.js';
import packageJson from "/package.json" assert { type: "json" };

const changeUrl = '/service/change';
const root = 'fiugd/beta';

const analyzeConfig = getAnalyzeConfig(root);
const onwarn = getOnWarn(root);

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const VERSION = `${packageJson.version}`;
const DATE = new Date().toISOString();
const AddVersion = async (code) => (await code).replace(/{{VERSION}}/g, VERSION);
const AddDate = async (code) => (await code).replace(/{{DATE}}/g, DATE);
const Minify = async (code) => Terser.minify((await code), terserConfig());

const writeFile = ({ path, code }) => {
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
	return fetch(changeUrl, opts).then(x => {
		if(!x.ok) throw new Error(x.statusText);
		return x.json();
	});
}

const copyFile = async (from, to) => {
	const code = await fetch(from).then(x => x.text());
	const path = to;
	return await writeFile({ path, code });
};

const CreateBuild = async (config) => {
	const generated = await rollup.rollup(config)
		.then(x => x.generate(config.output));
	const { code } = generated.output[0];
	return code;
};

const SaveBuild =  (config) => async (args) => {
	const { code, map } = await args;
	const path =  `./${config.output.file}`;
	return await writeFile({ path, code });
};

const build = async (rollupConfigDef) => {
	let error;

	const rollupConfig = typeof rollupConfigDef === "function"
		? rollupConfigDef
		: (await import(rollupConfigDef)).default;

	const {
		componentName,
		copyFiles=[],
		...config
	} = rollupConfig(root, analyzeConfig, onwarn);

	console.log(`\n${componentName} v${VERSION}`);
	console.log(`rollup v${rollup.VERSION}`);
	console.log(`\nbundling ...`);

	try {
		let response = await pipe(
			CreateBuild,
			AddDate,
			AddVersion,
			Minify,
			SaveBuild(config)
		)(config);

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
