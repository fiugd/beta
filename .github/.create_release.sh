#!/bin/sh

# this is ran at / NOT at ./.github, keep this in mind

mkdir /tmp/.release
cp -vr ./ /tmp/.release

mkdir ./.release
cp -vr /tmp/.release ./

rm -rf ./.release/.git
rm -rf ./.release/.github
rm -rf ./.release/.create_release.sh

echo "fiug.dev" > ./.release/CNAME

# TODO: verify here that package.json version matches version passed to this bash script
echo "Bash script thinks version is: $1"
