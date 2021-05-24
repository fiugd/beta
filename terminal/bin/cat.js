const description = 'Concatenate(print) FILE contents to standard output.';
const args = [{
	name: 'file', type: String, defaultOption: true, required: true
}];

const operation = async (args) => {
	const { file, cwd } = args;
	return await (await fetch(`${cwd}/${file}`)).text();
};


export default class Node {
	name = 'Concat';
	keyword = 'cat2';
	listenerKeys = [];
	description = description;
	usage = '[FILE]';
	args = args;

	constructor(){
		this.operation = operation;
		this.help = () => usage;
	}
}
