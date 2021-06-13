import { chalk, jsonColors } from '../.tools/terminal.utils.js';

const these = [
	['one', 5000],
	['two', 1000],
	['three', 300],
];

const delay = (time) => new Promise((resolve)=> setTimeout(() => resolve('done'), time) );

const AsyncTask = async (item) => {
	const [name, time] = item;
	console.log(`start execution ${name}`);
	//throw new Error('error test');
	//sleep(time); //<< will block other threads from starting
	await delay(time); //will allow worker to exit since it's a microtask... sigh
	console.log(`end execution ${name}`);
	await delay(1);
}

const mapTasks = () => these.map(async (item) => await AsyncTask(item));

const rainbow = (() => {
	let i=0;
	const colors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
	const colorsCount = colors.length

	return (line) => {
		i+=colorsCount/50
		const color = colors[Math.floor(i)%colorsCount];
		return chalk.hex(color)(line)
	};
})();

//console.log('start');
(async () => {
	//await Promise.allSettled(mapTasks());
	//await AsyncTask(these[0]);
	//console.log('done\n');
	for(var i=1, len=50; i<=len; i++){
		//await delay(600);
		console.log(rainbow(`${i} - test this`.padStart(15,' ')));
	}
	console.log(jsonColors({ test: 'hello' }))
})();