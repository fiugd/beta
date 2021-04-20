//show-preview

/*
https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a
https://gist.github.com/harlantwood/2935203
https://mdswanson.com/blog/2011/07/23/digging-around-the-github-api-take-2.html

https://github.com/crosshj/fiug-welcome/commits/WIP-testing-github-commiting
*/


import { consoleHelper, importCSS, logJSON, fetchJSON, stringify, getStored, htmlToElement } from '../.tools/misc.mjs';
import '../shared.styl';
consoleHelper();

/*
	files: { path, content, operation }[], operation is one of [create, update, delete]
	git: { owner, repo, branch }
	auth: github authorization token,
	message: commit message
*/
async function commit({ files, git, auth, message }){
	if(!auth) return { error: 'auth is required' };
	if(!message) return { error: 'message is required' };
	if(!git.owner) return { error: 'repository owner is required' };
	if(!git.branch) return { error: 'repository branch name is required' };
	if(!git.repo) return { error: 'repository name is required' };
	if(!files || !Array.isArray(files) || !files.length) return { error: 'no files were changed'};

	const opts = {
		headers: {
			authorization: `token ${auth}`,
			Accept: "application/vnd.github.v3+json"
		}
	};
	const fill = (url, obj) =>
		Object.keys(obj).reduce((all,one) =>
			all.replace(`{${one}}`, obj[one]),
		url);
	const baseUrl = "https://api.github.com";
	const urls = {
		rateLimit: '/rate_limit',
		branch: '/repos/{owner}/{repo}/branches/{branch}',
		tree: '/repos/{owner}/{repo}/git/trees',
		treeRecurse: '/repos/{owner}/{repo}/git/trees/{sha}?recursive=true',
		commit: '/repos/{owner}/{repo}/git/commits/{sha}',
		createCommit: '/repos/{owner}/{repo}/git/commits',
		blobCreate: '/repos/{owner}/{repo}/git/blobs',
		blobRaw: 'https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{blobPath}',
		refs: '/repos/{owner}/{repo}/git/refs/heads/{branch}'
	};
	Object.entries(urls).forEach(([k,v]) => {
		if(v[0] !== '/') return
		urls[k] = baseUrl + urls[k];
	});
	const ghFetch = async (templateUrl, params={}, extraOpts={}) => {
		const filledUrl = fill(templateUrl, { ...git, ...params });
		return await fetchJSON(filledUrl, {...opts, ...extraOpts });
	};
	const ghPost = async (url, params, body) => await ghFetch(url, params, {
		method: 'POST',
		body: JSON.stringify(body)
	});

	const blobCreate = ({ content }) => ghPost(urls.blobCreate, null,
		{ content: btoa(content), encoding: 'base64' }
	);
	const blobs = await Promise.all(files.map(blobCreate));
	const latest = await ghFetch(urls.branch);
	const fullTree = await ghFetch(urls.treeRecurse, { sha: latest?.commit?.sha });
	const treeToTree = ({ path, mode, type, sha }) => ({ path, mode, type, sha });
	const fileToTree = ({ path }, index) => ({
		path, mode: '100644', type: 'blob',	sha: blobs[index].sha
	});
	// in case files are deleted, should filter from fullTree here
	const tree = [ ...files.map(fileToTree), ...fullTree.tree.map(treeToTree)];
	const createdTree = await ghPost(urls.tree, null, { tree });
	const newCommit = await ghPost(urls.createCommit, null, {
		message, tree: createdTree.sha, parents: [ latest.commit.sha ]
	});
	const updateRefs = await ghPost(urls.refs, null, { sha: newCommit.sha });
	return updateRefs?.object?.sha
}

(async () => {
	const auth = getStored('Github Personal Access Token');
	const FakeFile = ([name, content]) => ({
		path: `commitTest/file-${name.toUpperCase()}.md`,
		content: new Array(25).fill().map(x => '### ' + content.toUpperCase()).join('   \n')
	});
	const files = `ace tantrum | intrepid dongle | tarnished iceberg`.split('|')
		.map(x => FakeFile(x.trim().split(' ')));
	const git = {
		owner: 'crosshj',
		repo: 'fiug-welcome',
		branch: 'WIP-testing-github-commiting' || 'main',
	};
	const message = `wip: ${new Date().toLocaleString('ja')}`

	const result = await commit({ auth, files, git, message });
	if(!result) return console.error('no result!')
	if(result.error) return console.error(result.error)
	document.body.append(htmlToElement(`
		<div>
			<span>result:</span>
			<a href="https://github.com/crosshj/fiug-welcome/commit/${result}">
				<button style="background: #99e;">${result.slice(0,7)}</button>
			</a>
		</div>
	`));
})();