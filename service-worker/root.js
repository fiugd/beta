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

# in the future, parse this and use for prompt
` + 
'export PS1="\[\\033[38;5;14m\]\h\[$(tput sgr0)\] \[$(tput sgr0)\]\[\\033[38;5;2m\]\W\[$(tput sgr0)\]\n\\$ \[$(tput sgr0)\]"'
+ `

`.trim() +'\n');

	await files.setItem("~/welcome", `
Welcome to fiug!

Here are some tips and examples.  Try these in the terminal to the right.

Clone a repo:
git clone crosshj/fiug-welcome

[OUT OF ORDER]
Use git config to set your name, email, ang github token.

[OUT OF ORDER]
List all cloned repos:
git list

[OUT OF ORDER]
Open a repo in editor:
git open crosshj/fiug-welcome

View names of changed files:
git status

View changes:
git diff

View changes in a specific file:
git diff README.md

Create and push a commit to github:
git commit -m "message about changes"

Download all templates for preview:
git clone crosshj/fiug-plugins

Previews files:
preview *.*

Preview a specific file:
preview README.md

Click on preview and hit Control to show a quit button.

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
