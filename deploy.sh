#!/bin/bash

cd dist;
cp index.html 404.html;
# GitHub Pages serves 404.html with a 404 status for any page that has no file of its own,
# so every page of the app gets a copy of index.html.
for page in insights questions eco-score green-score settings logos ingredients ingredient-detection ingredient-spellcheck brandinator dashboard nutriscore inao nutrition flagged-images packaging books gala bugs; do
  cp index.html "$page.html";
done
mkdir -p logos;
for page in index search product-search deep-search; do
  cp index.html "logos/$page.html";
done
cd ..;
