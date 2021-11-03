
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
const root = 'fiugd/beta';
const config = rollupConfig(root);

function writeFile({ path, code }){
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
	return fetch(changeUrl, opts);
}

function saveBuild({ code, map }){
	const path = `./${config.output.file}`;
	return writeFile({ path, code })
		.then(x => x.json());
}

async function copyFile(from, to){
	const code = await fetch(from).then(x => x.text());
	const path = to;
	return await writeFile({ path, code })
		.then(x => x.json());;
}

console.log(`\nfiug terminal v${VERSION}`);
console.log(`rollup v${rollup.VERSION}`);
console.log(`\nbundling ...`);

const build = async () => {
	let error;

	try {
		const generated = await rollup.rollup(config)
			.then(x => x.generate(config.output));
		const { code } = generated.output[0];
		const minified = await pipe(AddDate,AddVersion,Minify)(code);
		let response = await saveBuild(minified);
		if(response.error) throw new Error(response.error);

		response = await copyFile(
			`/${root}/terminal/terminal.html`,
			`./${root}/dist/terminal.html`
		);
		if(response.error) throw new Error(response.error);

		response = await copyFile(
			`/${root}/terminal/terminal.css`,
			`./${root}/dist/terminal.css`
		);
		if(response.error) throw new Error(response.error);

	} catch (e){
		const { loc } = e;
		if(loc){
			const { column, file, line } = loc;
			error = e.message + '\n' + `${file}\n line: ${line}, column: ${column}`;
		} else {
			error = e.message + '\n' + e.stack;
		}
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

await build();
