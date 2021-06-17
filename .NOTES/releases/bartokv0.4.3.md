![Release Image](https://bit.ly/fiugHexagons)

### bartok v0.4.3

steps to sanity:
- when a file is loaded from service worker (selected)
	- it is considered selected
	- it is pushed to opened array
	- if a file was selected previously
	- and was changed: keep it in opened array
	- and was not changed: pop it from opened array
- when a previously selected file is selected again
	- it is considered selected
	- it gets order:0 and other files get order:+1
- when a file is deleted
	- if selected: next file in order is selected & file is removed from opened array
	- if opened: it is removed from opened, following files get bumped up in order
- when a file is moved or renamed
	- it stays in order and selected state, it's details are updated

what if file is loaded from service worker, but not used by editor?


Currently, storage writes for this state are here:
modules/TreeView#L23
- https://github.com/crosshj/fiug-beta/blob/694dcfbe73e2c29c8c6c6e7f86cfe23010841612/modules/TreeView.mjs#L23


- delete
	- [ ] editor tabs: on file delete, close tab
	- [ ] rm command works properly for folder
	- [ ] handle delete files for commit
	- [ ] handle delete folders for commit

- copy
	- [ ] cp command works properly for files
	- [ ] cp command works properly for folders
	- [ ] copy works with commit

- move
	- [ ] mv command works properly for files
	- [ ] mv command works properly for folders
	- [ ] move works with commit

- [ ] preview should support wildcards, ie. \*.md
- [ ] preview with no arguments should preview current file (like old preview)
- [ ] preview help documentation

- [ ] git pull should bring in new changes (okay to reject if changes exist on local)
- [ ] service name issues with path in terminal
  - should not be able to cd lower than serviceName when service is loaded
  - cd /path should translate into serviceName/path

- [ ] paths which include ".." or "." work for all commands
- [ ] delay occurs before editor loads sometimes
	- need details about when this occurs
	
----

- [X] ls command needs to use the folder it was passed versus current state
- [X] tab doesn't appear sometimes even though editor loads
- [X] terminal watch mode for js files
- [X] recall scroll position when markdown preview (for example) updates
- [X] hook up editor context menu
- [X] markdown preview recall scroll position
- [X] clicking on a search result opens file at that line
- [X] base href in html, added in service worker
- [X] md/mkdir command works properly
- [X] syntax highlight broken with editor updates/revert
- [X] re-enable/fix editor updates from past
	- [X] editor document state
- [X] cd ../sibling results in parent//sibling (at 1 up from root)
- [X] terminal has its own cwd not dependent on app cwd
- [X] cat command works properly
- [X] better code fold behavior (gutter hover)
- [X] rm command works properly for file
- [X] touch command works properly
- [X] cd into parent/child results in going parent/parent/child
- [X] cd to / (root) then git commit/diff mess up
- [X] editor tabs close others, close all
- [X] explorer: fix new folder|file icons
- [X] when file is selected for preview, use full path of file
- [X] on commit, update file and changes stores
- [X] git commit should offer message on success/fail
- [X] something is messed up about cwd from app (esp for files at root)
- [X] tabs don't trigger editor properly
  - this specifically occurs with bartokv0.4.3.md
  - also occurs in other situations
  - switch services and come back (seems to trigger this)
