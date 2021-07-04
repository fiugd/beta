![Release Image](https://bit.ly/fiugHexagons)

# bartok v0.4.4
started: TBD
release: TBD

THEME: QUALITY | FINE-TOOTHED COMB
SUB-THEMES:
	- git++
	- SW++
	- editor++

> continue the work locking in "quality" started in (but not the main focus of) v0.4.3

- BE SMART
	- DO NOT: download all github files when cloning repo
		- balance this against offline usage
	- DO NOT: download all files in service manifest on first load
		- balance this against offline usage
	- DO: load editor modes as needed, cache and cleanup
	- DO: clean up editor state as needed
		- when undo file change reverts to unchanged state, this file is touched but no longer changed
		- when a touched file is closed, it is no longer touched
	- DO: clean up orphaned files
		- files that are not opened and not in tree should be removed from store
	- DO NOT: save files to wrong location with empty contents (BUG SOMEWHERE CAUSES THIS)
	- DO NOT: keep state in many different places
		- which files are open: tracked in SW and tabs
		- which files are changed: tracked in SW and tabs
		- editor changes and file changes in different stores

- IF IT IS VISIBLE, IT WORKS WELL
	- settings: does not show status of pulling/cloning
	- search: chokes sometimes
	- tabs: still weird issues / dancing
	- tree: parent folder not indicating changed child

- REMOVE DEAD CODE
	- terminal module
		- cleanup following rewrite/shift in mindset
		- includes removing old preview code
	- editor
		- load doc should be handled strictly by plugin
		- state should come from outside module
	- editor tabs
		- shift to rely strongly on SW state
	- tree | explorer
		- anything left from previous iteration?

---

write a custom CM mode that works by wrapping another syntax highlighter:
http://www.java2s.com/example/javascript/codemirror/codemirror-custom-mode-apply-styles-on-keywords.html

(or dynamically loads any given mode?)