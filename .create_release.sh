#!/bin/sh


mkdir /tmp/.release
cp -r ./ /tmp/.release

mkdir .release
cp -r /tmp/.release ./.release

echo "Bash script thinks version is: $1"

