#!/bin/sh


mkdir /tmp/.release
cp -vr ./ /tmp/.release

mkdir .release
cp -vr /tmp/.release ./.release

echo "Bash script thinks version is: $1"

