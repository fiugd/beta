// see also https://github.com/crosshj/vermiculate/blob/browser-vermiculate/test/_framework.js

//https://api.qunitjs.com/QUnit/test/
import QUnit from 'https://cdn.skypack.dev/qunit';
import chalk from "https://cdn.skypack.dev/chalk";

let finish;

const levels = {
	disabled: 0,
	basic16: 1,
	more256: 2,
	trueColor: 3
}
chalk.enabled = true;
chalk.level = levels.trueColor;

const { test: it, module: describe } = QUnit;
QUnit.config.autostart = false;

let allErrors = [];
const writeTest = (log, c) => test => {
	if(test.status === 'failed'){
		test.errors.forEach(e => {
			allErrors.push({
				...e,
				name: test.name
			})
		})
	} 
	const tab = '  ';
	const writer = {
		passed: () => `${tab}${c.green('✓')} ${c.dull(test.name)}`,
		failed: () => `${tab}${c.red('✗')} ${c.dullred(test.name)}`,
		skipped: () => `${tab}${c.yellow('○')} ${c.dullyellow(test.name)}`,
		todo: () => `${tab}${c.purple('»')} ${c.dullpurple(test.name)}`,
	};
	if(writer[test.status])
		return log(writer[test.status]());
	log(`[ ${test.status.toUpperCase()} ] : ${test.name}`);
};
const writeSuite = (log, colors) => suite => {
	log(suite.name);
	suite.tests.forEach(writeTest(log, colors));
	log();
};
const renderTest = (args) => {
	const { childSuites } = args;

	const colorize = chalk.hex.bind(chalk);
	const mapToColorizer = (col) => Object.entries(col)
		.reduce((a, [k,v]) => ({ ...a, [k]:colorize(v) }), {});
	const colors = mapToColorizer({
		green: '#00ff00',
		dull: '#a6a6a6',
		red: '#ff0000',
		dullred: '#f44',
		yellow: '#ff0',
		dullyellow: '#997',
		purple: '#f5f',
		dullpurple: '#a9a'
	});

	childSuites.forEach(
		writeSuite(console.log, colors)
	);
	allErrors.length && console.log(JSON.stringify(allErrors, null, 2));
};
QUnit.on("runEnd", (args) => {
	renderTest(args);
	if(finish) finish();
});

const start = (done) => {
	console.log('\x1bc'); // clear screen
	finish = done;
	QUnit.start.bind(QUnit)();
};

export default {
	describe, it, start
};
