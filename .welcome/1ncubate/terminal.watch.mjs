import commandLineArgs from 'https://cdn.skypack.dev/command-line-args';

//NOTE: sucks that I have to customize internal instance of chalk
import chalk2 from "https://cdn.skypack.dev/-/chalk@v2.4.2-3J9R9FJJA7NuvPxkCfFq/dist=es2020,mode=imports/optimized/chalk.js";
import colorize from 'https://cdn.skypack.dev/json-colorizer';
// enable browser support for chalk
(() => {
	const levels = {
		disabled: 0,
		basic16: 1,
		more256: 2,
		trueColor: 3
	}
	chalk2.enabled = true
	chalk2.level = levels.trueColor;
})()
const colors = {
	BRACE: '#BBBBBB',
	BRACKET: '#BBBBBB',
	COLON: '#BBBBBB',
	COMMA: '#BBBBBB',
	STRING_KEY: '#dcdcaa',
	STRING_LITERAL: '#ce9178',
	NUMBER_LITERAL: '#b5cea8',
	BOOLEAN_LITERAL: '#569cd6',
	NULL_LITERAL: '#569cd6',
};

/*

the idea here is to register a command with terminal

for example:

watch (better name pending) 
- takes -event argument which is followed by a list of events
- registers an event listener with main app
- logs those events to terminal until CTRL-C is pressed
- once exited, removes the event listener

*/

const optionDefinitions = [{
	name: 'events',
	alias: 'e',
	type: String,
	multiple: true,
}];

async function invoke(args){
	const { execute, list, attach, detach } = this.comm;
	const options = {
		argv: args.trim().split(' ')
	};
	const result = commandLineArgs(optionDefinitions, options);

	if(!result?.events){
		done();
		return
	}
	const { events } = result;
	const listener = (args) => {
		const { detail } = args;
		this.term.write(colorize(detail, { colors, pretty: true }));
		this.term.write('\n');
	};
	const name = "TerminalWIP";
	for(var i=0, len=events.length; i<len; i++){
		const response = await attach({
			name, listener,
			eventName: events[i],
		});
		this.listenerKeys.push(response?.key)
	}
	this.term.write('\n');
}

async function exit(){
	try {
		for(var i=0, len=this.listenerKeys.length; i<len; i++){
			await detach(this.listenerKeys[i]);
		}
	} catch(e){}
	return;
}

export class Watch {
	keyword = 'watch';
	listenerKeys = [];
	term = undefined;

	constructor(term, Communicate){
		this.term = term;
		this.comm = Communicate;
		this.invoke = invoke.bind(this);
		this.exit = exit.bind(this)
	}
}