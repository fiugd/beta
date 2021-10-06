#!/bin/sh


mkdir /tmp/.release
cp -vr ./ /tmp/.release

mkdir .release
cp -vr /tmp/.release ./

rm -rf ./.release/.git
rm -rf ./.release/.github

echo "Bash script thinks version is: $1"

