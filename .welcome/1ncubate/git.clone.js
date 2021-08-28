/*

GOALS:
- clone a repo that doesn't already exist
- pull/fetch a repo that already exists

- load a repo that already exists
- list all repos that are cloned
- list all repos from an owner
- list all branches for a repo

- do everything this does (lol) https://cli.github.com/

BLOCKER:
- can't access sessionStorage in worker, need it for github auth

SOLUTIONS:
? 1) beef up communication between worker and main page, expose sessionStorage
* 2) read/write file (with token in it) using serviceWorker, implement .gitignore so this file isn't checked in
* 3) service worker can read github auth and use it

2 & 3 can be seen as the same solution give or take the .gitignore part

fetch("https://beta.fiug.dev/service/change", {
	"body": "{\n  \"path\": \"./crosshj/fiug-beta/secrets.json\",\n  \"code\": \"{}\\n\",\n  \"service\": \"crosshj/fiug-beta\"\n}",
	"method": "POST",
});

fetch("https://beta.fiug.dev/crosshj/fiug-beta/secrets.json", {
	"body": "{\n  \"path\": \"./crosshj/fiug-beta/secrets.json\",\n  \"code\": \"{}\\n\",\n  \"service\": \"crosshj/fiug-beta\"\n}",
	"method": "GET",
});

https://github.com/nodeca/js-yaml
https://github.com/eemeli/yaml

https://codemirror.net/mode/yaml/index.html

*/

try {
	const auth = ''; //sessionStorage.getItem('Github Personal Access Token');

	const cloneUrl = 'https://beta.fiug.dev/service/create/provider';
	const bodyObj = {
		providerType:"github-provider",
		auth,
		repo: "crosshj/footils",
		branch:"master",
		operation:"provider-add-service"
	};
	const body = JSON.stringify(bodyObj);
	const method = 'POST';

	console.log(`\nCloning ${bodyObj.repo}, ${bodyObj.branch} branch...`)

	const { result } = await fetch(cloneUrl, { body, method }).then(x=>x.json());
	const { services } = result;
	const [ cloned ] = services;

	//console.log(JSON.stringify(cloned, null, 2));
	//console.log(clone.name);
	console.log(`DONE`);
} catch(e){
	console.log(`ERROR: ${e.message}`)
}

