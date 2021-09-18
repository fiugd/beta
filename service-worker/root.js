const initRootService = async ({ stores }) => {
	const {services, files, changes} = stores;
	const service = {
		name: '~',
		id: 0,
		type: 'default',
		tree: { '~': {
			'.git': { config: {} },
			'.profile': {},
			'settings.json': {},
			'welcome': {}
		}},
	};
	await services.setItem('0', service);
	await files.setItem("~/.git/config", '\n');
	await files.setItem("~/settings.json", '{}');

	await files.setItem("~/.profile", `
# configure prompt here
# https://phoenixnap.com/kb/change-bash-prompt-linux
# http://bashrcgenerator.com/

# in the future, parse this and use for prompt` + 
'export PS1="\[\\033[38;5;14m\]\h\[$(tput sgr0)\] \[$(tput sgr0)\]\[\\033[38;5;2m\]\W\[$(tput sgr0)\]\n\\$ \[$(tput sgr0)\]"'
+ `

`.trim() +'\n');

	await files.setItem("~/welcome", `
Welcome to fiug!

Here are some tips and examples.

Clone a repo:
git clone crosshj/fiug-welcome

Open a repo in editor:
git open crosshj/fiug-welcome

View all changed files:
git status

View changes:
git diff

Create and push a commit to github:
git commit -m "message about changes"

Download all templates for preview:
git clone crosshj/fiug-plugins

This previews a file
preview *.*

Click on preview and hit Control to show a quit button.

Use git config to set your name, email, ang github token.


`.trim() +'\n');

	await changes.setItem(`state-${service.name}-opened`, [
		{ name: 'welcome', order: 0 }
	]);

	return service;
};

class RootService {
	constructor(stores){
		this.stores = stores;
		this.init = () => initRootService(this);
	}
}

export { RootService };
