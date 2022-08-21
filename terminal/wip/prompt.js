/*
here's an example of how to build CLI apps
TODO: build this!!!

also, consider using parent dependency, `mri`, which maybe doesn't call process.exit

Did you mean (feature):
-----------------------

typed     ->  git opne 1
suggested -> Did you mean "git open 1" ?

I can type 'y' to run the corrected command

Required arguments are wrapped with < and > characters.
Optional arguments are wrapped with [ and ] characters.
*/

import sade from 'https://cdn.skypack.dev/sade';
const prog = sade("builder");

if(typeof processWrite !== "undefined"){
	console.error = processWrite;
	console.log = processWrite;
}

// const argv = ["", "", "--help"];
// const argv = ["", "", "build", "--help"];
const argv = ["", "", "create", "--help"];

// const argv = ["", "", "build", "src", "build", "-o", "main.js"];
// const argv = ["", "", "-v"];
// const argv = ["", "builder", "b", "src", "dest"];

console.log("\nCOMMAND: " + argv.join(" ") + "\n");

prog
	.version('1.0.5')
	.option('--global, -g', 'An example global flag')
	.option('-c, --config', 'Provide path to custom config', 'default.config.js');

prog
	.command('build <src> <dest>')
	.alias('b', 'bu')
	.describe('Build the source directory. Expects an `index.js` entry file.')
	.option('-o, --output', 'Change the name of the output file', 'bundle.js')
	.example('build src build --global --config my-conf.js')
	.example('build app public -o main.js')
	.action((src, dest, opts) => {
		console.log(`> building from ${src} to ${dest}\n`);
		console.log('> options: ', JSON.stringify(opts, null, 2), "\n");
	});

prog
	.command('create [name] [folder]')
	.alias('c', 'cr')
	.describe('Build the source directory. Expects an `index.js` entry file.')
	.option('-o, --output', 'Change the name of the output file', 'bundle.js')
	.example('create name foldername')
	.example('c name')
	.action((src, dest, opts) => {
		console.log(`> created something \n`);
		console.log('> options: ', JSON.stringify(opts, null, 2), "\n");
	});

prog.parse(argv);
