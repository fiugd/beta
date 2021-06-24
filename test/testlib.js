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
//QUnit.config.autostart = false;

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
		dull: '#aabbbb',
		red: '#ff0000',
		dullred: '#f44',
		yellow: '#ff0',
		dullyellow: '#997',
		purple: '#f5f',
		dullpurple: '#a9a',
		orange: '#ff8867',
		dullorange: '#ce9178'
	});

	childSuites.forEach(
		writeSuite(console.log, colors)
	);

	allErrors.length && allErrors.forEach((e, i) => {
		console.log();
		console.log(colors.orange(`ERROR ${i+1}:\n  ${e.name}`));
		e.message && console.log(colors.orange(`  ${e.message}`));
		console.log(colors.dullorange(`${
			e.stack
				.replace(/https:\/\/(.*)fiug.dev/, '')
				.replace(/Object.<anonymous> /, '')
		}`));
		
	});

	//TODO: summary
};
QUnit.on("runEnd", (args) => {
	renderTest(args);
	if(finish) finish();
});

QUnit.assert.custom = function(errors) {
	errors.forEach(this.pushResult);
};

const start = (done) => {
	console.log('\x1bc'); // clear screen
	finish = done;
	QUnit.start.bind(QUnit)();
};

const expect = (actual) => {
	//https://github.com/sapegin/jest-cheat-sheet
	return {
		toEqual: (expected) => {
			const msg = `expected ${actual} to equal ${expected}`;
			QUnit.assert.true(actual === expected, msg)
		},
		toBeTruthy: () => {
			const msg = `expected ${actual} to be truthy`;
			QUnit.assert.true(!!actual, msg)
		}
	}
}

export default {
	describe, it, start, expect
};
