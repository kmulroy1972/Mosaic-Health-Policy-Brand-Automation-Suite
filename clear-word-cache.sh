#!/bin/bash
# Clear Word Add-in Cache

echo "Clearing Word add-in cache..."

# Close Word if running
killall "Microsoft Word" 2>/dev/null || true

# Clear add-in cache
rm -rf ~/Library/Containers/com.microsoft.Word/Data/Documents/wef
rm -rf ~/Library/Containers/com.microsoft.Word/Data/Library/Caches/*

echo "Cache cleared! Now:"
echo "1. Start Word again"
echo "2. Open a document"
echo "3. Click the 'Show Taskpane' button in the Home ribbon"




