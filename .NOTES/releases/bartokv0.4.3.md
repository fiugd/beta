![Release Image](https://bit.ly/fiugHexagons)

# bartok v0.4.3
started: 2021-04-20
release: TBD

- [ ] copy is not hooked up in tree

- [ ] sw freaks and app doesn't crash well:
	- [ ] with dragging a file from one new folder to another new folder
- [ ] rename file and folder need to be verified

- [ ] commits
	- delete
		- [ ] handle delete files for commit
		- [ ] handle delete folders for commit
	- copy 
		- [ ] handle copy files for commit
		- [ ] handle copy folders for commit
	- move
		- [ ] handle move files for commit
		- [ ] handle move folders for commit

- [ ] on editor scroll, show page overlay for a moment then disappear
- [ ] preview: if current doc matches matcher, show it after preview command exec'ed

- [ ] delay occurs before editor loads sometimes
	- issue seems to occur because of file store get

----
- [X] paths which include ".." or "." work for all commands
- [X] cp command works properly for files
- [X] cp command works properly for folders
- [X] terminal commands do not terminate properly
- [X] .keep files seem to not be created for new folder
- [X] cp is not present in terminal
- [X] mv command works properly for files
- [X] mv command works properly for folders
- [X] preview help documentation
- [X] preview should support wildcards, ie. \*.md
- [X] preview with no arguments should preview current file (like old preview)
- [X] context menu for editor
- [X] preview as a terminal command vs a menu item
	- preview should honor selected file when service switched (may not do this)
- [X] rm command works properly for folder
- [X] editor tabs: on file delete, close tab (and switch editor)
- [X] service name issues with path in terminal
  - should not be able to cd lower than serviceName when service is loaded
  - cd /path should translate into serviceName/path
- [X] git diff at root is messed up
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