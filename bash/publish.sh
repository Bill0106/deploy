#!/bin/bash

cd ../test
cp index.html index.html.backup
echo $1 | tee index.html
