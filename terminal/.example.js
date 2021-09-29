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
}

(async () => {
	console.log('start');
	await Promise.all(these.map(AsyncTask));
	console.log('done\n');

	//throw new Error('woops');

	postMessage({ exit: true });
})();
