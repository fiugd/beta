const alotOfEvents = [
	'ui', 'fileClose', 'fileSelect', 'operations', 'operationDone',
];
const history = [
	'watch -e fileSelect',
	`watch -e ${alotOfEvents.join(' ')}`,
];

export class History {
	current = -1;
	history = history;

	constructor({ chalk, getBuffer, setLine, setBuffer, writeLine }){
		this.chalk = chalk;
		this.getBuffer = getBuffer;
		this.setBuffer = setBuffer;
		this.setLine = setLine;
		this.writeLine = writeLine;

		this.next = this.next.bind(this);
		this.prev = this.prev.bind(this);
		this.print = this.print.bind(this);
		this.push = this.push.bind(this);
		this.updateBuffer = this.updateBuffer.bind(this);
		this.updateLine = this.updateLine.bind(this);
	}

	get currentItem(){
		return [...this.history].reverse()[this.current];
	}

	next(){
		if(this.current < 0) return
		this.current--;
		this.updateLine();
	}

	prev(){
		if(this.current === this.history.length -1) return;
		this.current++;
		this.updateLine();
	}

	print(){
		const { chalk, history, writeLine } = this;
		writeLine('\n');
		const EXTRA_PADDING = 3;
		const padding = Math.floor(history.length/10) + EXTRA_PADDING;
		history.slice(0,-1)
			.forEach((h,i) => {
				writeLine(`${chalk.dim((i+1+'').padStart(padding, ' '))}  ${h}\n`)
			})
	}

	push(command){
		this.history.push(command);
		this.current = -1;
	}

	updateBuffer(){
		const { currentItem, setBuffer } = this;
		if(!currentItem) return;
		setBuffer(currentItem);
		this.current = -1;
	}

	updateLine(){
		const { current, history, setLine, getBuffer } = this;
		if(current === -1) return setLine(getBuffer());
		setLine([...history].reverse()[current]);
	}
}