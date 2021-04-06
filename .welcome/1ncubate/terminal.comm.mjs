const target = window.top;
const queue = {};

const kvArrayToObject = ([key, value]) => ({ key, value })
const list = () => Object.entries(queue).map(kvArrayToObject);

window.onmessage = function(e){
	const { key, ...rest } = e.data;
	if(!queue[key]) return;

	if(!queue[key].resolve){
		queue[key].listener(rest);
		return
	}

	queue[key].resolve(rest);
	if(queue[key].listener){
		delete queue[key].resolve;
	} else {
		delete queue[key];
	}
};

const randomKey = () => Array.from(
	{ length : 32 },
	() => Math.random().toString(36)[2]
).join('');

const execute = (data) => {
	const key = randomKey();
	const handler = (resolve) => {
		queue[key] = { resolve };
		target.postMessage({ ...data, key }, '*');
	};
	return new Promise(handler)
};

const attach = ({ name, eventName, listener }) => {
	const key = randomKey();
	const register = 'listener';
	const data = { register, name, eventName };
	const handler = (resolve) => {
		queue[key] = { resolve, listener };
		target.postMessage({ ...data, key }, '*');
	};
	return new Promise(handler)
};

const detach = (key) => {
	const unregister = 'listener';
	const data = { register, key };
	const handler = (resolve) => {
		queue[key] = { resolve };
		target.postMessage({ ...data, key }, '*');
	};
	return new Promise(handler)
};

export {
	attach,
	detach,
	execute,
	list
}