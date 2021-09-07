//import uglifyJs from 'https://cdn.skypack.dev/uglify-js';

/*
typescript transpiler: 
babel: https://github.com/crosshj/fiug-plugins/blob/main/.templates/jsx.html
*/

import chalk from 'https://cdn.skypack.dev/chalk';
chalk.enabled = true;
chalk.level = 3;

const grey = x => console.log(chalk.hex('#ccc')(x));

import importMap from "https://beta.fiug.dev/importmap.importmap" assert { type: "json" };
console.log(JSON.stringify(importMap))
import Babel from 'https://cdn.skypack.dev/@babel/standalone';

import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
const {clearScreen} = ansiEscapes;
// const clearScreen = '';

console.log(clearScreen + `\n` + `TODO / THINK ABOUT:`)
grey(`
	1) load some files which are worker-bound
	2) shim for bare specifier, using importMap? package.json
	3) import a module for console.log / process.stdout.write ? (as in a node module)
	4) shim for process.exit ? (as in a node module)
		- https://github.com/rpetrich/babel-plugin-transform-async-to-promises/blob/master/async-to-promises.ts

	this will be used like /-/worker/filepath, eg. /-/worker/crosshj/fiug-beta/module.js
	service worker will rewrite and serve this versus the original source

	can this be of help? https://github.com/guybedford/es-module-shims

	fiug-beta/shared/vendor/codemirror/update.js publishes a import map now
		- available at https://beta.fiug.dev/importmap.importmap

	https://www.sitepoint.com/understanding-asts-building-babel-plugin/

`.replace(/^	/gm, ''));


function importsPlugin() {
	return {
		visitor: {
			ImportDeclaration(path) {
				// if first char is a / then prepend self.location.origin
				// otherwise suss out? ../ or ./ etc?
				// "node" is doing this
				// keep in mind that we may want those modules to use SW worker transform
				if(importMap.imports[path.node.source.value]){
					path.node.source.value = importMap.imports[path.node.source.value]
				}
				return;
			},
		},
	};
}
Babel.registerPlugin('importMap', importsPlugin);


function consolePlugin({ types: t}) {
	return {
		visitor: {
			// Identifier(path) {
			// 	console.log(path.node.name+'\n')
			// 	path.node.name = 'IDENT';
			// },
			CallExpression(path) {
				if(!path.node.callee.property) return;
				//path.node.callee.property && (path.node.callee.property.name = 'CALLEE');
				if(path.node.callee.object.name !== 'console' || path.node.callee.property.name !== 'log') return;

				path.replaceWith(
					t.callExpression(
						t.identifier('processWrite'),
						path.node.arguments
					)
				);
				//path.node.arguments = path.node.arguments.map(x => t.stringLiteral('ARGS'));
			},
			// ExpressionStatement(path){
			// 	path.node.name && (path.node.name = 'EXP');
			// },
			MemberExpression(path){
				// if(t.isAssignmentExpression(path.parent)) return;
				// if(t.isIdentifier(path.node.property)) {
				// 	path.node.property = t.stringLiteral(path.node.property.name);
				// }
				// if(path.node.property.value !== 'log') return;
				// path.replaceWith(t.identifier('mori'));
				// path.replaceWith(
				// 	t.memberExpression(t.identifier('mori'), t.identifier('hashMap'))
				// );
			}
		},
	};
}
Babel.registerPlugin('console', consolePlugin);

function processExitPlugin({ types: t}){
	return {
		visitor: {
			AwaitExpression(path){
				const selfHooks = t.memberExpression(
					t.identifier('self'),
					t.identifier('hooks')
				);
				const selfHookCount = t.memberExpression(
					selfHooks,
					t.identifier('length')
				);
				const hookBlock = t.blockStatement([
					t.expressionStatement(
						t.assignmentExpression(
							'=',
							t.memberExpression(
								selfHooks,
								selfHookCount,
								true //computed prop
							),
							path.node.argument
						)
					),
					t.returnStatement(
						t.memberExpression(
							selfHooks,
							t.binaryExpression('-',
								selfHookCount,
								t.numericLiteral(1)
							),
							true //computed prop
						)
					)
				])
				path.node.argument = 
					t.callExpression(
						t.arrowFunctionExpression([], hookBlock ),
						[]
					)
				;
			},
			FunctionDeclaration(path){
				if(!path.node.async) return;
				//console.log('found an async function')
			},
		}
	};
}
Babel.registerPlugin('processExit', processExitPlugin);

const NODE_PRE = `
const processWrite = (...args) => postMessage({ log: args });
const console = {};
console.warn = console.info = processWrite;
console.error = (error) => {
	const cleanerError = error?.message
		? { message: error.message, stack: error.stack }
		: error;
	postMessage({ error: cleanerError });
};
self.hooks = [];
//END NODE_PRE -------------------------------

`;

const NODE_POST = `


// START NODE_POST ---------------------------
setTimeout(async () => {
	a`+`wait Promise.allSettled(self.asyncHooks);
	queueMicrotask(() => { postMessage({ exit: true }); });
}, 1);
`;

const exampleSrc = `
	import {
		fo, tw, hj as cool
	} from 'chalk';

	import rel from '../rel';
	import rel2 from './rel';

	async function helloWorld(){
		console.log('hello');
		a`+`wait alert('hello', 'yeh');
		const foo = a`+`wait example()
			.then(x => x.json());
		return foo;
	}
	a`+`wait helloWorld();

`;
var output = Babel.transform(exampleSrc, {
	plugins: ['importMap', 'console', 'processExit'],
	//sourceType: "module"
});

console.log(NODE_PRE + output.code + NODE_POST)
