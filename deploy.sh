#!/bin/sh
echo "Hello world"

git add .
git commit -m 'test push with shell script'
git push -u origin main

echo "Pushed to remote repository"