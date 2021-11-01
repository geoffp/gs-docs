#!/bin/sh

# Generate fixed-up version of the original!
#
# Requirements:
# - HTML tidy (brew install tidy-html5)
# - Python 3
# - Beautiful Soup 4 (pip3 install beautifulsoup4)

# scrub it clean!
tidy -q -i --doctype html5 --clean yes --drop-empty-paras yes -o index.html 65c816opcodes.html 2> /dev/null

# alter it
python3 ./alter

# re-indent
tidy -q -i --clean yes --bare yes --custom-tags blocklevel -m index.html 2> /dev/null
