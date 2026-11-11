#!/bin/sh
# Builds blog-assets/sample-one-sheet.pdf from the HTML source using headless Chrome (US Letter, one page).
cd "$(dirname "$0")/../.." || exit 1
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$PWD/blog-assets/sample-one-sheet.pdf" "file://$PWD/scripts/one-sheet/sample-one-sheet.html" 2>&1 | tail -1
ls -la blog-assets/sample-one-sheet.pdf
