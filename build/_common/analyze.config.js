export default (root, chalk, braces) => ({
	//root: location.origin+'/',
	root: ' ', // << so that externals are not filtered out, and process.env does not exist...
	summaryOnly: true,
	limit: 7,
	writeTo: (x) => processWrite('DONE\n\n'+
			chalk.hex('#ccc')(x)
				.replace(/█/g, chalk.hex('#636')('█'))
				.replace(/░/g, chalk.hex('#2a2a43')('█'))
				.replace(/\((.*)\)/g, chalk.hex('#dad')('| $1')) +
			chalk.hex('#aaa')('\n\n       . . . [ analysis truncated for brevity ] . . . \n\n\n')
		),
	transformModuleId: (x) => chalk.hex('#dfe')('\n' +
		braces(x.replace(`${location.origin}/${root}/`, '')) + '\n'
	)
});
