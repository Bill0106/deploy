#!/bin/bash

echo "Cloning into $1..."
cd ..
git clone --progress git@github.com:Bill0106/$1.git
echo "$1 cloned"

git checkout $2
echo

echo "start building commit $2..."
cd $1
npm i
npm run build

echo "Do Finally Clean"
cd ..
mv $1/dist deploy
rm -rf $1
