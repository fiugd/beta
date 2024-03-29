export const jestConfig = () => {
	return `
module.exports = {
	modulePathIgnorePatterns: [
		'<rootDir>/__services'
	],
	testPathIgnorePatterns: [
		'__services'
	],
	transform: {
		".*.js": "<rootDir>/node_modules/babel-jest"
	},
};
`.trim() + '\n';
};
