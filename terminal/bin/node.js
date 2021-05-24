const help = () => {};

const operation = async (...args) => {
	console.log(args);
	return 'TODO: node - should run a file'
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
