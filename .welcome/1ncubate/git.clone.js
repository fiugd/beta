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
		repo: "XAMPPRocky/numcount",
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
