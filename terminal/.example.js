import { sleep } from './.example_import.js';

const these = [
	['one', 5000],
	['two', 1000],
	['three', 300],
];

const delay = (time) => new Promise((resolve)=> setTimeout(resolve, time) );

const AsyncTask = async (item) => {
	const [name, time] = item;
	console.log(`start execution ${name}`);
	//throw new Error('error test');
	sleep(time); //<< will block other threads from starting
	//await delay(time); //will allow worker to exit since it's a microtask... sigh
	console.log(`end execution ${name}`);
};

Promise.all(these.map(AsyncTask));
//AsyncTask(these[0]);
