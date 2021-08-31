import chalk2 from "https://cdn.skypack.dev/-/chalk@v2.4.2-3J9R9FJJA7NuvPxkCfFq/dist=es2020,mode=imports/optimized/chalk.js";
import colorize from 'https://cdn.skypack.dev/json-colorizer';
import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
import detectIndentation from 'https://cdn.skypack.dev/detect-indentation';
import detectIndent from 'https://cdn.skypack.dev/detect-indent';

const levels = {
	disabled: 0,
	basic16: 1,
	more256: 2,
	trueColor: 3
}
chalk2.enabled = true;
chalk2.level = levels.trueColor;

const safeDetectIndentation = (text) => {
	try {
		return detectIndentation(text);
	} catch(e){
		return e.message;
	}
};
const getText = url => fetch(`https://beta.fiug.dev/crosshj/fiug-beta/${url}`).then(x=>x.text());

const tabs = 'tabs';
const spaces = 'spaces';

const exampleTexts = [
	['.git/config', tabs],
	['shared/vendor/codemirror.js', ],
	['shared/vendor/js-treeview.1.1.5.js', ],
	['shared/vendor/json5v-2.0.0.min.js', ],
	['shared/vendor/materialize.min.js', ],
	['.welcome/1ncubate/indent-auto.js', ],
	['modules/service-worker.handler.js', ],
	['.welcome/1ncubate/zip_project.html'],
];

console.log(ansiEscapes.clearScreen);

console.log(`
detect indentation and set that when file loads, if it's not already set

some examples using the first 2 libs I found:`)


for(let i=0, len=exampleTexts.length; i<len; i++){
	const [url,expect] = exampleTexts[i];
	console.log('');
	console.log(chalk2.hex('#aff')(url))
	const input = await getText(url);
	const din8n = safeDetectIndentation(input);
	console.log(chalk2.hex('#aaa')(`  detectIndentation:\n  `)+JSON.stringify(din8n, null, 2));
	const di = detectIndent(input);
	console.log(chalk2.hex('#aaa')(`  detectIndent:\n  `)+JSON.stringify(di))
}
/*
*/