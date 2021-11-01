export const welcome = () => `
Welcome to fiug!
================

Try out the terminal on the right.

#### configure git:
\`git config --global user.name jaind\`
\`git config --global user.email jain.day@ellery.com\`
\`git config --global user.token {your github token}\`

#### clone a repo:
\`git clone fiugd/welcome\`

#### list all cloned repos:
\`git list\`

#### open/close a repo in editor:
\`git open fiugd/welcome\`
\`git close\`

#### view names of changed files:
\`git status\`

#### view changes:
\`git diff\`

#### view changes in a specific file:
\`git diff README.md\`

#### create and push a commit to github:
\`git commit -m "message about changes"\`

#### download all templates (for preview):
\`git clone fiugd/plugins\`

#### preview files:
\`preview\`

#### preview a specific file:
\`preview README.md\`

#### quit preview
1. click preview pane
2. press Control
3. click quit

`.trim() +'\n';
