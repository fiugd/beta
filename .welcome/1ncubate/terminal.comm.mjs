const queue = {};

const list = () => Object.entries(queue).map(([key,value]) => ({ key, value }));

window.onmessage = function(e){
	const { key, ...rest } = e.data;
	if(!queue[key]) return;
	queue[key](rest);
	delete queue[key];
};

const randomKey = () => Array.from(
	{ length : 32 },
	() => Math.random().toString(36)[2]
).join('');

const execute = (target) => (...data) => {
	const key = randomKey();
	const handler = (resolve) => {
		queue[key] = resolve;
		target.postMessage({ ...data, key }, '*');
	};
	return new Promise(handler)
};

export {
	execute,
	list
}