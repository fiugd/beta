/*
TODO:
 - handles left and right arrow keys + editing
 - handles tab completion
 - maybe bring other code into here (history, etc)

also see https://github.com/wavesoft/local-echo
*/
export default class CommandLineAddon {
	_terminal;
	_disposables = [];
	_cursor = 0;
	_currentLine;

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
		if(buffer !== this._currentLine){
			this._currentLine = buffer;
			this._cursor = buffer.length;
		}

		// if cursor is not set to end and char is got
		// make sure buffer is updated correctly
		//console.log(data.substr(1))
		switch(data.substr(1)) {
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
				// if(buffer.length - this._cursor > 0){
				// 	if(data === "\x7F"){ // BACKSPACE
				// 		console.log('backspace')
				// 		this._terminal.write(' ');
				// 		break;
				// 	}
				// 	this._terminal.write(data + buffer.slice(this._cursor));
				// 	new Array(buffer.length - this._cursor).fill().forEach(x => this._terminal.write('\x1b[D'));
				// 	this.setBuffer(buffer.slice(0, this._cursor) + data + buffer.slice(this._cursor));
				// } else {
				// 	this._terminal.write(data);
				// 	this.setBuffer(buffer + data);
				// }
				// this._cursor = this._cursor + 1;
				break;
		}

		//console.log({ buffer, cursor: this._cursor });

		//this._cursor = this._cursor + 1;
	}

	_onBinary(data){
		console.log('got binary');
		console.log(data);
	}

};
