const help = () => {};

const operation = async (args) => {
	const { file, cwd } = args;
	const scriptText = await (await fetch(`${location.origin}/${cwd}/${file}`)).text();
	const header = 'console.log = (...log) => postMessage({ log });';
	//TODO: should run script in worker that immediately exits versus eval
	return eval(header+scriptText);
};

export default class Node {
	keyword = 'node';
	listenerKeys = [];

	args = [{
		name: 'file', alias: 'f', type: String, defaultOption: true, required: true
	}, { 
		name: 'watch', alias: 'w', type: Boolean, required: false 
	}]

	constructor(){
		this.operation = operation;
		this.help = () => help;
	}
}
