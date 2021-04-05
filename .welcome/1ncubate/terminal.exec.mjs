import commandLineArgs from 'https://cdn.skypack.dev/command-line-args';
import { execute, list, attach } from './terminal.comm.mjs';


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

async function invoke(args, term, done){
	const options = {
		argv: args.trim().split(' ')
	};
	const result = commandLineArgs(optionDefinitions, options);

	if(!result?.events){
		done();
		return
	}

	console.log(result);
	const { events } = result;
	const listener = (...args) => {
		debugger
		console.log(JSON.stringify(args, null, 2))
	};
	const name = "TerminalWIP";
	for(var i=0, len=events.length; i<len; i++){
		const response = await attach({
			name, listener,
			eventName: events[i],
		});
		console.log(response);
	}
	done();
}

export class Watch {
	keyword = 'watch';

	constructor(){
		this.invoke = invoke;
	}
}