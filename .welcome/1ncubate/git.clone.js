/*

GOALS:
- clone a repo that doesn't already exist
- pull/fetch a repo that already exists

- load a repo that already exists
- list all repos that are cloned
- list all repos from an owner
- list all branches for a repo

- do everything this does (lol) https://cli.github.com/

*/

const cloneUrl = 'https://beta.fiug.dev/service/create/provider';
const bodyObj = {
	"providerType":"github-provider",
	"auth": "",
	"repo": "crosshj/fiug-beta",
	"branch":"main",
	"operation":"provider-add-service"
};
const body = JSON.stringify(bodyObj);
const method = 'POST';

(async () => {

	console.log(`\nCloning ${bodyObj.repo}, ${bodyObj.branch} branch...`)
	const { result } = await fetch(cloneUrl, { body, method }).then(x=>x.json());
	const { services } = result;
	const [ cloned ] = services;

	//console.log(JSON.stringify(cloned, null, 2));
	//console.log(clone.name);
	console.log(`DONE`);

})();
