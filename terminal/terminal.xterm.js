import { Link } from './terminal.utils.js';
import { WebLinksAddon } from 'https://cdn.skypack.dev/xterm-addon-web-links@0.4';

export default () => {
	const options = {
		theme: {
			background: "rgba(255, 255, 255, 0.0)", // '#1e1e1e',
			//fontFamily: 'consolas'
		},
		allowTransparency: true,
		fontSize: 13,
		//fontFamily: 'Ubuntu Mono, courier-new, courier, monospace',
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


	const linkstart = Link.start;
	const linkend = Link.end;
	const linkHandler = (e, uri) => {
		const cleanUri = Link.text(uri);
		if(cleanUri !== uri) return term.onInternalLink(cleanUri);
		window.open(uri);
	}
	const linkMatcherOpts = {};
	const useLinkProvider = false;
	//https://xtermjs.org/docs/api/terminal/interfaces/ilinkmatcheroptions/

	/*

	https://github.com/xtermjs/xterm.js/pull/538
	https://npmdoc.github.io/node-npmdoc-xterm/build/apidoc.html#apidoc.module.xterm.Linkifier
	https://github.com/xtermjs/xterm-addon-web-links

	https://github.com/xtermjs/xterm-addon-web-links/blob/master/src/WebLinksAddon.ts
	would love for links back to the main part of app:
		- git diff could use this, esp.
		- could be useful for ls command, etc

	import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes@4.3.2';
	ansiEscapes.link(text, url)
	- not sure xterm.js supports this yet, though

	CLOSED ISSUE: https://github.com/xtermjs/xterm.js/issues/583
	*/

	const originalActivate = WebLinksAddon.prototype.activate;
	WebLinksAddon.prototype.activate = function(term){
		this._terminal = term;
		if(this._useLinkProvider){
			return originalActivate.bind(this)(term);
		}
		const protocolClause = '(https?:\\/\\/)';
		const domainCharacterSet = '[\\da-z\\.-]+';
		const negatedDomainCharacterSet = '[^\\da-z\\.-]+';
		const domainBodyClause = '(' + domainCharacterSet + ')';
		const tldClause = '([a-z\\.]{2,6})';
		const ipClause = '((\\d{1,3}\\.){3}\\d{1,3})';
		const localHostClause = '(localhost)';
		const portClause = '(:\\d{1,5})';
		const hostClause = '((' + domainBodyClause + '\\.' + tldClause + ')|' + ipClause + '|' + localHostClause + ')' + portClause + '?';
		const pathCharacterSet = '(\\/[\\/\\w\\.\\-%~:+@]*)*([^:"\'\\s])';
		const pathClause = '(' + pathCharacterSet + ')?';
		const queryStringHashFragmentCharacterSet = '[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&\'*+,:;~\\=\\.\\-]*';
		const queryStringClause = '(\\?' + queryStringHashFragmentCharacterSet + ')?';
		const hashFragmentClause = '(#' + queryStringHashFragmentCharacterSet + ')?';
		const negatedPathCharacterSet = '[^\\/\\w\\.\\-%]+';
		const bodyClause = hostClause + pathClause + queryStringClause + hashFragmentClause;
		const start = '(?:^|' + negatedDomainCharacterSet + ')(';
		const end = ')($|' + negatedPathCharacterSet + ')';
		const strictUrlRegex = protocolClause + bodyClause;

		const matchFiug = `${linkstart}` + `(.*)` + pathClause + linkend;
		const originalRegex = new RegExp(start + `(${strictUrlRegex}|${matchFiug})` + end);
		
		const handler = {};
		const i = originalRegex || new Proxy(originalRegex, handler);

		this._linkMatcherId = this._terminal.registerLinkMatcher(
			i, this._handler, this._options
		);
	};

	const linksAddon = new WebLinksAddon(linkHandler, linkMatcherOpts, useLinkProvider);
	term.loadAddon(linksAddon);

	term._attachHandlers = ({ bubbleHandler, keyHandler, internalLinkHandler }) => {
		term.attachCustomKeyEventHandler(bubbleHandler);
		term.onKey(keyHandler);
		term.onBinary((...args) => {
			console.log({ args })
		});
		term.onInternalLink = internalLinkHandler;
	};

	return term;
}