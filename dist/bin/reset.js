const description = "Reset fiug's state";
const args = [];

const operation = async (args) => {
	console.log('remove moduleCache')
	localStorage.removeItem('moduleCache');
	return '';
};

export default class Node {
	name = 'Reset';
	keyword = 'reset';
	listenerKeys = [];
	type = 'plain';
	description = description;
	usage = '';
	args = args;

	constructor(){
		this.operation = operation;
		this.help = () => usage;
	}
};
