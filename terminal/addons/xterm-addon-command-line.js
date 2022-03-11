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
		console.log(buffer);
		console.log(this._cursor);

		// if cursor is not set to end and char is got
		// make sure buffer is updated correctly

		if(['[C'].includes(data.substr(1)) ){
			this._terminal.write(data);
			this._cursor = this._cursor + 1;
			return;
		}
		if(['[D'].includes(data.substr(1)) ){
			if(this._cursor <= 0) return;
			this._terminal.write(data);
			this._cursor = this._cursor - 1;
			return;
		}
		this._cursor = this._cursor + 1;
	}

	_onBinary(data){
		console.log('got binary');
		console.log(data);
	}

};
