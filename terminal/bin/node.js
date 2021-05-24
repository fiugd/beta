const help = () => {};

const operation = async (...args) => {
	return 'TODO: node'
};

export default class Node {
	keyword = 'node';
	listenerKeys = [];

	args = [{
		name: 'file', alias: 'f', type: String, default: true, required: true
	}, { 
		name: 'watch', alias: 'w', type: String, required: false 
	}]

	constructor(){
		this.operation = operation;
		this.help = () => help;
	}
}
