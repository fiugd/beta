import { sleep } from './.example_import.js';

if(typeof document !== "undefined"){
	document.body.innerHTML += `
		<style>body{ margin: 2em;color: #777; font: 20px sans-serif; }</style>
		<div>This file is used for testing with "node" keyword.</div>
		<div>See console out.</div>
	`;
}

const these = [
	['one', 5000],
	['two', 1000],
	['three', 300],
];

const AsyncTask = async (item) => {
	const [name, time] = item;
	console.log(`start execution ${name}`);
	//throw new Error('error test');
	
	// will block other threads from starting
	// sleep(time);

	//will allow worker to exit since it's a microtask... sigh
	await sleep(time);

	console.log(`end execution ${name}`);
	await sleep(1);
}

const mapTasks = () => these.map(async (item) => await AsyncTask(item));

console.log('start');
await Promise.allSettled(mapTasks());
console.log('done\n');
