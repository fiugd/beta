/*

	I'm not sure exactly where this will live in deployed app
	I do know that it should be importable like so...

	import { argv } from process;

	also, I think this should be available even when not explicitly imported like so...

	console.log(process.env);


	the whole point of this initially is to enable the following

	node build/build.js editor.config.js

*/


// https://nodejs.org/api/process.html

// TODO: message parent/node and await response for arguments
const argv = [
	'/usr/local/bin/node',
	'/some/script',
	'argument1',
];

// TODO: message parent/node to exit worker
const exit = () => {};

// TODO: message parent/node to write a message to console
const write = () => {};

// TODO: take input from terminal
const stdin = () => {};

// TODO: message parent/node to stdout (not sure how this is diff from write)
const stdout = () => {};

export {
	argv, exit, write, stdin, stdout
};
