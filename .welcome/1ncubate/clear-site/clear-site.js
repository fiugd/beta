//TODO: make importing from something local less annoying
//ALSO: make errors more obvious
//import localforage from "https://beta.fiug.dev/shared/vendor/localforage.min.js"

import localforage from 'https://cdn.skypack.dev/localforage';
function getStores(){
	const files = localforage
		.createInstance({
				name: 'service-worker',
				storeName: 'files',
		});
	return { files };
};

import ansiEscapes from 'https://cdn.skypack.dev/ansi-escapes';
const {clearScreen} = ansiEscapes;


import chalk from "https://cdn.skypack.dev/-/chalk@v2.4.2-3J9R9FJJA7NuvPxkCfFq/dist=es2020,mode=imports/optimized/chalk.js";
const levels = {
	disabled: 0,
	basic16: 1,
	more256: 2,
	trueColor: 3
}
chalk.enabled = true;
chalk.level = levels.trueColor;
const grey = x => console.log(chalk.hex('#ccc')(x));
const blue = x => console.log(chalk.hex('#adf')(x));
const yellow = x => console.log(chalk.hex('#fd0')(x));


console.log(clearScreen);

yellow('The point of this exercise:')
grey(`
create a command/util which clears fiug state:
- file, services, changes, handlers stores
- cache storage
- session storage [needs to be exposed in app, or just not used]
- local storage [needs to be exposed in app, or just not used]

This should cause the service worker to update in a new state on refresh.
see index.service.test.html and all of the things it does

Some of the code here could be used for:
- creating a disk/memory usage (du) utility
- pulling all files for offline
- reading/writing .git folder, ie. git config

`.trim());


const stores = getStores();
const keys = await stores.files.keys();

yellow('\n' + 'Some files:');
grey([...keys.slice(0,5), '...'].join('\n'));

yellow('\n' + 'Current Working Dir:');
grey(cwd);

const configSrc = `
[user]
	name = crosshj
	email = github@crosshj.com
	password = ***
`.trim();
await stores.files.setItem('/.git/config', configSrc);
const gitConfig = await stores.files.getItem('/.git/config');
yellow('\n' + 'Git Config:');
grey(gitConfig);