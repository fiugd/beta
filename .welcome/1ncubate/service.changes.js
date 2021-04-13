//show-preview
import Diff from 'https://cdn.skypack.dev/diff-lines';
import { consoleHelper, importCSS, logJSON, fetchJSON, stringify, getStored } from '../.tools/misc.mjs';
import '../shared.styl';
consoleHelper();

const showDiffLines = ({ fileName, original, value }) => {
	const diff = Diff(original, value, { n_surrounding: 0 });

	const diffEl = document.createElement('pre');
	diffEl.className = 'info';
	diffEl.innerHTML = `<div>${fileName}</div>` +
		`@@\n${diff}`.split('\n').map((x,i,all) => {
			const space = (str) => `${str[0]}  ${str.slice(1)}`;
			if(x[0] === '-') return `
				<div style="background:#4a1212;">${space(x)}</div>`.trim();
			if(x[0] === '+') return `
				<div style="background: #113111;">${space(x)}</div>`.trim();
			if(x.slice(0,2) === '@@') return `
				<div style="color:#B753B7;">\n...\n\n</div>`.trim();
			return `<div>  ${x}</div>`;
		}).join('');
	document.body.append(diffEl);
}

const getChanges = async () => {
	const changesUrl = "/service/change";
	const changesResponse = await fetchJSON(changesUrl+"?cwd=.welcome/1ncubate");
	//logJSON(changesResponse)
	changesResponse.changes.forEach(x => {
		console.log(Object.keys(x))
		showDiffLines(x);
	})
};

getChanges();
