import { WebLinksAddon } from 'https://cdn.skypack.dev/xterm-addon-web-links';

export default () => {
	const options = {
		theme: {
			background: "rgba(255, 255, 255, 0.0)", // '#1e1e1e',
			//fontFamily: 'consolas'
		},
		allowTransparency: true,
		fontSize: 13,
		fontFamily: 'Ubuntu Mono, courier-new, courier, monospace',
		//fontWeight: 100,
		convertEol: true,
		//rendererType: 'dom',
	};
	const term = new Terminal(options);
	term.open(document.querySelector('#terminal .term-contain'));

	const fitAddon = new FitAddon.FitAddon();
	term.loadAddon(fitAddon);
	const fit = fitAddon.fit.bind(fitAddon);
	//term.onResize(fit);
	window.addEventListener("resize", fit);
	fit();

	/*
	term.loadAddon(new WebLinksAddon({
		handler: (e, uri) => alert(`Attempt to navigate to: ${uri}`)
	}));
	*/
	term.loadAddon(new WebLinksAddon());

	term._attachHandlers = ({ bubbleHandler, keyHandler }) => {
		term.attachCustomKeyEventHandler(bubbleHandler);
		term.onKey(keyHandler);
	};

	return term;
}
