
why do editor tabs not work?

reduce the need for:
	- state.js
	- Types.js
	- Listeners.js
	- 

add status bar to editor

there should be only one events handling file


### PATH TO SANITY
- break editor.js and editorTabs.js up
	- components get modularized and referenced
	- event attachment should congeal from there
- make editorEvents and editorTabEvents super simple
	- bring listeners into editor.js and editorTabs.js
	- figure out how to cope with this ^^^ later

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