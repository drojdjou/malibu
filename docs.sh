#!/bin/bash

rm -Rf docs/*
jsdoc -d docs -R tutorials/home.md -u tutorials/ src/*