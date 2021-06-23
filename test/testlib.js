//https://api.qunitjs.com/QUnit/test/

import chalk from "https://cdn.skypack.dev/chalk";
const levels = {
	disabled: 0,
	basic16: 1,
	more256: 2,
	trueColor: 3
}
chalk.enabled = true;
chalk.level = levels.trueColor;


import QUnit from 'https://cdn.skypack.dev/qunit';
const { test: it, module: describe } = QUnit;
//QUnit.config.autostart = false;

const writeTest = (log, c) => test => {
	const tab = '  ';
	const writer = {
		passed: () => `${tab}${c.green('✓')} ${c.dull(test.name)}`,
		failed: () => `${tab}${c.red('✗')} ${c.dullred(test.name)}`,
		skipped: () => `${tab}${c.yellow('○')} ${c.dullyellow(test.name)}`,
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
		dullred: '#f88',
		yellow: '#ff0',
		dullyellow: '#997'
	});

	childSuites.forEach(
		writeSuite(console.log, colors)
	);
};

QUnit.on("runEnd",renderTest);

export default {
	describe, it,
	start: QUnit.start.bind(QUnit)
};
