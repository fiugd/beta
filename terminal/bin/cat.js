const operation = async (args) => {
	const { file, cwd } = args;
	return await (await fetch(`${cwd}/${file}`)).text();
};