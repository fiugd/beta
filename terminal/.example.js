import _ from 'lodash';

console.log('\n\nlodash test');
console.log('----------------')
console.log('lodash version: ' + _.VERSION);
let words = [
	'sky', 'wood', 'forest', 'falcon',
	'pear', 'ocean', 'universe'
];
console.log(`First element: ${_.first(words)}`);
console.log(`Last element: ${_.last(words)}`);
console.log('----------------\n\n\n');


const { sleep }  = await import('./.example_import2.js');

const these = [
	['one', 3000],
	['two', 2000],
	['three', 1000],
];

const AsyncTask = async (item) => {
	const [name, time] = item;
	console.log(`start: ${name}`);
	await sleep(time);
	console.log(`end: ${name}`);
};

(async () => {
	console.log('start');
	await Promise.all(these.map(AsyncTask));
	console.log('done\n');

	//throw new Error('woops');

	postMessage({ exit: true });
})();
