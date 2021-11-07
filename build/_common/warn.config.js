export default (root, chalk, braces) => (warning) => {
	//if (warning.code === 'EVAL') return
	//if (warning.code === 'THIS_IS_UNDEFINED') return;
	//console.log(JSON.stringify(warning, null, 2))
	const message = [
		'\nWARNING:\n',
		warning.message, '\n',
		warning.loc ? `[${warning.loc.line}:${warning.loc.column}] ` : '',
		warning.id ? `${braces(warning.id.replace(root+'/', ''))}\n` : '',
	].join('');
	console.log(chalk.yellow(message));
};