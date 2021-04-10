//show-preview

/*
https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a
https://gist.github.com/harlantwood/2935203
https://mdswanson.com/blog/2011/07/23/digging-around-the-github-api-take-2.html
*/


import { appendUrls, consoleHelper, htmlToElement, importCSS, prism } from '../.tools/misc.mjs';
import 	'../shared.styl';
consoleHelper();

const commitMessage = 'WIP create commit programmatically'
	+ ' - change some files'

const stringify = o => JSON.stringify(o,null,2);
const fetchJSON = (url, opts) => fetch(url, opts).then(x => x.json());
const getStored = (varName) => {
	const stored = sessionStorage.getItem(varName);
	if(stored) return stored;
	const prompted = prompt(varName);
	sessionStorage.setItem(varName, prompted);
	return prompted;
};
const fill = (template, obj) =>
	Object.keys(obj).reduce((all,one) =>
		all.replace(`{${one}}`, obj[one]),
	template);
const logJSON = obj => console.log(JSON.stringify(obj, null, 2));

const baseUrl = "https://api.github.com";
const urls = {
	rateLimit: baseUrl + '/rate_limit',
	branch: baseUrl + '/repos/{owner}/{repo}/branches/{branch}',
	tree: baseUrl + '/repos/{owner}/{repo}/git/trees',
	getTreeRecursive: baseUrl + '/repos/{owner}/{repo}/git/trees/{sha}?recursive=true',
	commit: baseUrl + '/repos/{owner}/{repo}/git/commits/{sha}',
	createCommit: baseUrl + '/repos/{owner}/{repo}/git/commits',
	createBlob: baseUrl + '/repos/{owner}/{repo}/git/blobs',
	rawBlob: 'https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{blob.path}',
	refs: baseUrl + '/repos/{owner}/{repo}/git/refs/heads/{branch}'
};
const auth = getStored('Github Personal Access Token');

const opts = { headers: {} };
if(auth) opts.headers.authorization = `token ${auth}`;
opts.headers.Accept = "application/vnd.github.v3+json";

const defaultParams = {
	owner: 'crosshj',
	repo: 'fiug-welcome',
	branch: 'WIP-testing-github-commiting' || 'main',
};

const ghFetch = async (templateUrl, params={}, extraOpts={}) => {
	const filledUrl = fill(templateUrl, { ...defaultParams, ...params });
	return await fetchJSON(filledUrl, {...opts, ...extraOpts });
};

const FakeFile = (name, content) => {
	return {
		path: `commitTest/file-${name.toUpperCase()}.md`,
		content: new Array(25).fill()
			.map(x => content.toUpperCase())
			.join('   \n')
	}
}
const files = [
	FakeFile('dice', 'cramp'),
	FakeFile('taste', 'ease'),
	FakeFile('bereft', 'moniker'),
];

(async () => {

const createBlob = (file) => ghFetch(urls.createBlob, null, {
	method: 'POST',
	body: JSON.stringify({
		content: btoa(file.content),
		encoding: 'base64'
	})
});
const blobs = await Promise.all(files.map(createBlob))

const latest = await ghFetch(urls.branch);

const baseTree = await ghFetch(urls.commit, { sha: latest.commit.sha });
//logJSON({ baseTree });

const fullTree = await ghFetch(urls.getTreeRecursive, { sha: latest.commit.sha })
//logJSON(fullTree);
const mapTreeItem = ({path,mode,type,sha})=>({path,mode,type,sha});

fullTree.tree = [
	...files.map((file, index) => ({
		path: file.path,
		mode: '100644',
		type: 'blob',
		sha: blobs[index].sha
	})),
	...fullTree.tree.filter(x =>
		!x.path.includes('commitTest')
		&& x.type !== 'tree'
	),
].map(mapTreeItem);

const createdTree = await ghFetch(urls.tree, null, {
	method: 'POST',
	body: JSON.stringify({
		tree: fullTree.tree,
		//basetree: baseTree.sha
	}),
});
//logJSON({ createdTree })

const newCommit = await ghFetch(urls.createCommit, null, {
	method: 'POST',
	body: JSON.stringify({
		message: commitMessage,
		tree: createdTree.sha,
		parents: [ latest.commit.sha ]
	})
})

const updateRefs = await ghFetch(urls.refs, null, {
	method: 'POST',
	body: JSON.stringify({
		sha: newCommit.sha,
		//sha: '55a59a2b28a0a3f0213dbd5a66390ae0724e4ea7',
		//force: true
	})
})
logJSON({ updateRefs });

})();