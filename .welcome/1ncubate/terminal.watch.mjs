import { chalk, jsonColors } from './terminal.utils.mjs';

const link = url => chalk.hex('#9cdcfe')(url)

// TODO: would be nice if this were auto-generated
const usage = `

${chalk.bold('Usage:')} watch ${chalk.hex('#BBB')('[OPTION]... [ARGUMENT(S)]...')}

Print details of chosen events as they occur in the system.

  -e, --event  ${chalk.hex('#BBB')('event(s)')}    Events to watch
  -h, --help   ${/* SPACER                */''}    Prints this guide

${chalk.bold('Examples:')}
  watch -e fileSelect
  watch -e ui fileClose fileSelect operations operationDone

${chalk.italic(`
Online help: ${link('https://github.com/crosshj/fiug/wiki')}
Report bugs: ${link('https://github.com/crosshj/fiug/issues')}
`)}
`;

async function invoke(args, done){
	const { execute, list, attach, detach } = this.comm;

	if(args.help || !args?.events?.length){
		this.term.write(usage);
		done();
		return
	}
	const { events } = args;
	const listener = (args) => {
		const { detail } = args;
		this.term.write(jsonColors(detail));
		this.term.write('\n');
	};

	for(var i=0, len=events.length; i<len; i++){
		const response = await attach({
			name: this.keyword,
			listener,
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

// this could mean not having to attach term, comm for each plugin
// export class Watch extends Plugin { maybe ???
export class Watch {
	keyword = 'watch';
	listenerKeys = [];
	term = undefined;

	cliArgOptions = [
		{ name: 'events', alias: 'e', type: String, multiple: true },
		{ name: 'help', alias: 'h', type: Boolean }
	]

	constructor(term, Communicate){
		this.term = term;
		this.comm = Communicate;
		this.invoke = invoke.bind(this);
		this.exit = exit.bind(this)
	}
}