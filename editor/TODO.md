
- [ ] connect to service worker (or overall app)
	- [X] internal messages go to outside
	- external messages come to inside
- [ ] insert editor iframe into app
	- [X] editor build
	- [ ] dist in service manifest
- [ ] bring codemirror deps into editor folder

- [X] tiggers have proper namespace
	- some triggers may need to be removed
- [X] reduce the need for:
	- state.js
	- Types.js
	- Listeners.js
- [X] a single events handling file
- [X] break editor.js and editorTabs.js up
	- components get modularized and referenced
	- event attachment should congeal from there
- [X] make editorEvents and editorTabEvents super simple
	- bring listeners into editor.js and editorTabs.js
	- figure out how to cope with this ^^^ later
- [X] why do editor tabs not work?
- [X] add status bar to editor


### events & UI
> listen: for events coming from outside
> trigger: to self & outside

1. components
	- render UI
	- expose their handlers
2. event modules declare event connections
3. main component
	- arranges/instantiates rendering
	- connects events with instances