/*

GOALS:
- clone a repo that doesn't already exist
- pull/fetch a repo that already exists

- load a repo that already exists
- list all repos that are cloned
- list all repos from an owner
- list all branches for a repo

- do everything this does (lol) https://cli.github.com/

TODO:
- service worker should:
	- ignore contents of .git folder
	- use .git/config as below(except with global scope) for credentials

- git config support for the following, mind the "global"
	> git config --global user.name "fname lname"
	> git config --global user.email "example@gmail.com"
	> git config --global user.password "secret"
	- because repo ("local") is not available before git clone

- when git commit fails should not blow away changes


OTHER:
https://github.com/nodeca/js-yaml
https://github.com/eemeli/yaml

https://codemirror.net/mode/yaml/index.html

codemirror ini files (like .git/config
https://codemirror.net/mode/properties/index.html

*/

import ini from 'https://cdn.skypack.dev/ini';

try {

	const configUrl = 'https://beta.fiug.dev/crosshj/fiug-beta/.git/config';
	const configText = await fetch(configUrl).then(x=>x.text());
	const gitConfig = ini.parse(configText);

	const auth = gitConfig.user.password;

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
