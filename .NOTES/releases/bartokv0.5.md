<!-- no-select -->
<h1 style="display:none"></h1>
![image](https://bit.ly/fiugLandscape1)

Summary
=======

  - [ ] open file from file search
  - [ ] click to select file from command palette opener
  - [ ] on repo "clone", don't pull all files (instead wait for pull or pull as needed)
  - [ ] preview as a terminal command vs a menu item
  - [ ] terminal should get cwd and service name from query params
  - [ ] terminal left/right arrows for editing buffer

  - [ ] editor tabs order of next tab closing should make sense
  - [ ] explorer: add expand|collapse
  - [ ] explorer: overscroll seems to not be working
  - [ ] explorer: scroll bar hide/show causes status circle to dance


Current State
=============

##### meta
  - [ ] themes fixed
  - [ ] cleaner loading view
  - [X] import files
  - [X] export files
  - [ ] !!! bartok version at bottom left should be connected to real something

##### paneView
  - [ ] golden layout or similar for pane splitting

##### explorer
  - [ ] rename project/service

##### editor
  - [ ] auto-detect tabs vs spaces
  - [ ] linter - https://codemirror.net/demo/lint.html
  - [ ] show 80 char limit line
  - [ ] scrolled shadow at top to indicate file is scrolled down

##### terminal
  - [ ] mouse clicks on terminal to select menu items (?)
  - [ ] loading spinner & done checkmark
    - https://stackoverflow.com/questions/2685435/cooler-ascii-spinners
    - http://jsfiddle.net/sindresorhus/2eLtsbey/embedded/result/
    - https://github.com/sindresorhus/cli-spinners/blob/HEAD/spinners.json

##### server
  - [ ] deploy pipeline
    - https://jenkins.io/projects/blueocean/

##### statusBar

##### serviceMap
  - https://www.weave.works/oss/scope/

![image](https://bit.ly/fiugLanscape2)

![image](http://bit.ly/fiugLandscape3)

![image](http://bit.ly/fiugLandscape4)

<style>
  #container p:first-child img {
    filter: hue-rotate(377deg) contrast(1.25) saturate(4);
  }
  #container p:nth-child(18) img {
    filter: hue-rotate(53deg) contrast(1.25) saturate(5);
  }
  #container p:nth-child(19) img {
    filter: hue-rotate(0deg) contrast(1.25) saturate(7);
  }
  #container p:nth-child(20) img {
    filter: hue-rotate(132deg) contrast(1.25) saturate(4);
  }
</style>
