<!-- no-select -->
<h1 style="display:none"></h1>
![Release Image](https://bit.ly/fiugHexagons)

# bartok v0.4.3

  - [ ] handle rename, delete, move files for commit
  - [ ] terminal watch mode for js files
  - [ ] terminal has its own cwd not dependent on app cwd
  - [ ] git pull should bring in new changes (okay to reject if changes exist on local)

  - [ ] cd ../sibling results in parent//sibling
  - [ ] cat command works properly
  - [ ] mv command works properly
  - [ ] md/mkdir command works properly
  - [ ] rm command works properly for folder

  - [ ] .. paths work for all commands

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
