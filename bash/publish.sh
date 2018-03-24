#!/bin/bash

cd ../$1
cp index.html index.html.backup
echo $2 | tee index.html
