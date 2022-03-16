/*
TODO:
 - handles left and right arrow keys + editing
 - handles tab completion
 - maybe bring other code into here (history, etc)

also see https://github.com/wavesoft/local-echo
*/
//const DEBUG = document.URL.includes('beta.fiug.dev/fiugd/beta/dist');


export default class CommandLineAddon {
	_terminal;
	_disposables = [];
	_cursor = 0;
	_currentLine;
	_history = [];

	constructor({ setBuffer, getBuffer }){
		this.setBuffer = setBuffer;
		this.getBuffer = getBuffer;
	}

	activate(terminal) {
		this._terminal = terminal;
		this._disposables.push(
			terminal.onData(data => this._onData(data))
		);
		this._disposables.push(
			terminal.onBinary(data => this._onBinary(data))
		);
	}

	dispose(){
		for (const d of this._disposables) {
			d.dispose();
		}
	}

	_onData(data){
		const buffer = this.getBuffer();
		const prevLine = this._currentLine;
		const prevCursor = this._cursor;

		if(buffer !== this._currentLine){
			this._currentLine = buffer;
			this._cursor = buffer.length;
		}

		if(data === '\r'){
			this._cursor = 0;
			this._currentLine = '';
			this.setBuffer('');
			return;
		}

		switch(data.substr(1)) {
			case '[A': //up arrow
				if(this._history.length && this._history[this._history.length-1] === buffer) break;
				this._history.push({ buffer: prevLine||'', cursor: prevCursor||0 });
				break;
			case '[B': //down arrow
				const historyItem = this._history.pop();
				if(historyItem === undefined) return;
				const { buffer:buff, cursor } = historyItem;
				if(buff === undefined) break;
				this.setBuffer(buff);
				this._cursor = cursor;
				if(this._history.length) break;
				new Array(buffer.length).fill().forEach(x => this._terminal.write('\b \b'));
				this._terminal.write(buff);
				break;
			case '[C':
				this._terminal.write(data);
				this._cursor = this._cursor + 1;
				break;
			case '[D':
				if(this._cursor <= 0) break;
				this._terminal.write(data);
				this._cursor = this._cursor - 1;
				break;
			default:
				if(buffer.length - this._cursor > 0){
					if(data === "\x7F"){ // BACKSPACE
						if(this._cursor <= 0) return;
						this.setBuffer(buffer.slice(0, this._cursor-1) + buffer.slice(this._cursor));
						this._terminal.write('\x1b[D' + buffer.slice(this._cursor) + ' ');
						new Array(buffer.length - this._cursor +1).fill().forEach(x => this._terminal.write('\x1b[D'));
						this._cursor = this._cursor - 1;
						break;
					}
					this._terminal.write(data + buffer.slice(this._cursor));
					new Array(buffer.length - this._cursor).fill().forEach(x => this._terminal.write('\x1b[D'));
					this.setBuffer(buffer.slice(0, this._cursor) + data + buffer.slice(this._cursor));
					this._cursor = this._cursor + 1;
				} else {
					if(data === "\x7F"){ // BACKSPACE
						if(this._cursor <= 0) return;
						this.setBuffer(buffer.slice(0, -1));
						this._cursor = this._cursor - 1;
						this._terminal.write('\b \b');
						break;
					}
					this._terminal.write(data);
					this.setBuffer(buffer + data);
					this._cursor = this._cursor + 1;
				}
				break;
		}
		this._currentLine = this.getBuffer();
	}

	_onBinary(data){
		console.log('got binary');
		console.log(data);
	}

};
