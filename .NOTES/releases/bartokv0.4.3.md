![Release Image](https://bit.ly/fiugHexagons)

### bartok v0.4.3

- [ ] hook up editor context menu
- [ ] reveal in sidebar is broken
- [ ] uploading images + binary files
- [ ] search has performance issues
- [ ] delay occurs before editor loads sometimes
	- need details about when this occurs
- [ ] tab doesn't appear sometimes even though editor loads
	- need details about when this occurs
- [ ] clean up for editor document state
- [ ] make sure editor undo history works properly
- [ ] preview should honor selected file when service switched
- [ ] recall scroll position when markdown preview (for example) updates


---

- [ ] ls command needs to use the folder it was passed versus current state
- [ ] handle rename, delete, move files for commit
- [ ] terminal watch mode for js files
- [ ] git pull should bring in new changes (okay to reject if changes exist on local)
- [ ] service name issues with path in terminal
  - should not be able to cd lower than serviceName when service is loaded
  - cd /path should translate into serviceName/path

---

- [ ] rm command works properly for folder
- [ ] editor tabs: on file delete, close tab
- [ ] mv command works properly
- [ ] cp command works properly

---

- [ ] paths which include ".." or "." work for all commands

----

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
