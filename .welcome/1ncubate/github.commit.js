//show-preview

/*
https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a
https://gist.github.com/harlantwood/2935203
https://mdswanson.com/blog/2011/07/23/digging-around-the-github-api-take-2.html

https://github.com/crosshj/fiug-welcome/commits/WIP-testing-github-commiting
*/


import { consoleHelper, importCSS, logJSON, fetchJSON, stringify, getStored } from '../.tools/misc.mjs';
import '../shared.styl';
consoleHelper();

const commitMessage = 'github commits check it out now'

const fill = (template, obj) =>
	Object.keys(obj).reduce((all,one) =>
		all.replace(`{${one}}`, obj[one]),
	template);

const baseUrl = "https://api.github.com";
const urls = {
	rateLimit: '/rate_limit',
	branch: '/repos/{owner}/{repo}/branches/{branch}',
	tree: '/repos/{owner}/{repo}/git/trees',
	treeRecurse: '/repos/{owner}/{repo}/git/trees/{sha}?recursive=true',
	commit: '/repos/{owner}/{repo}/git/commits/{sha}',
	createCommit: '/repos/{owner}/{repo}/git/commits',
	blobCreate: '/repos/{owner}/{repo}/git/blobs',
	blobRaw: 'https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{blob.path}',
	refs: '/repos/{owner}/{repo}/git/refs/heads/{branch}'
};
Object.entries(urls).forEach(([k,v]) => {
	if(v[0] !== '/') return
	urls[k] = baseUrl + urls[k];
});
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
			.map(x => '### ' + content.toUpperCase())
			.join('   \n')
	}
};
const randomWords = `
poker talk
carrot frenzy
dance makeup
`.trim().split('\n').map(x => x.trim().split(' '))
const files = [
	FakeFile(...randomWords[0]),
	FakeFile(...randomWords[1]),
	FakeFile(...randomWords[2]),
];

(async () => {

const blobCreate = (file) => ghFetch(urls.blobCreate, null, {
	method: 'POST',
	body: JSON.stringify({
		content: btoa(file.content),
		encoding: 'base64'
	})
});
const blobs = await Promise.all(files.map(blobCreate))

const latest = await ghFetch(urls.branch);

const baseTree = await ghFetch(urls.commit, { sha: latest.commit.sha });
//logJSON({ baseTree });

const fullTree = await ghFetch(urls.treeRecurse, { sha: latest.commit.sha })
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
//logJSON({ updateRefs });
if(updateRefs?.object?.sha)
	return console.info('seems like it worked!')
else
	console.error('maybe a fail?')

})();