#!/bin/sh


mkdir /tmp/.release
cp -vr ./ /tmp/.release

mkdir .release
cp -vr /tmp/.release ./

echo "Bash script thinks version is: $1"

