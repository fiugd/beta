// const operation = async (args) => {
// 	const { file, cwd } = args;
// 	return await (await fetch(`${cwd}/${file}`)).text();
// };

const help = () => {};

const operation = async (args) => {
	const { file, cwd } = args;
	return await (await fetch(`${cwd}/${file}`)).text();
}

export default class Node {
	keyword = 'cat2';
	listenerKeys = [];

	args = []

	constructor(){
		this.operation = operation;
		//this.help = () => help;
	}
}