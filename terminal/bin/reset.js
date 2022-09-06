const description = "Reset fiug's state";
const args = [];

const operation = async (args) => {
	localStorage.removeItem('moduleCache');
	return '';
};

export default class Node {
	name = 'Reset';
	keyword = 'reset';
	listenerKeys = [];
	description = description;
	usage = '';
	args = args;

	constructor(){
		this.operation = operation;
		this.help = () => usage;
	}
};
