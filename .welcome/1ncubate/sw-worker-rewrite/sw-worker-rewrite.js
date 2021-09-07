
//import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
//const {clearScreen} = ansiEscapes;
const clearScreen = '';

console.log(clearScreen + `\n` + `
	TODO / THINK ABOUT:

	1) load some files which are worker-bound
	2) shim for bare specifier, using importMap? package.json
	3) import a module for console.log / process.stdout.write ? (as in a node module)
	4) shim for process.exit ? (as in a node module)

	this will be used like /-/worker/filepath, eg. /-/worker/crosshj/fiug-beta/module.js
	service worker will rewrite and serve this versus the original source

	can this be of help? https://github.com/guybedford/es-module-shims

	fiug-beta/shared/vendor/codemirror/update.js publishes a import map now
		- available at https://beta.fiug.dev/importmap.importmap

`.replace(/^	/gm, '').trim());
