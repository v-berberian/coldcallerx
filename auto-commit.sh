#!/bin/bash

# Auto-commit and push script
# This script watches for changes and automatically commits and pushes them

WATCH_DIR="/Users/vadykk/coldcallerx/src"
LAST_COMMIT_TIME=0

auto_commit_and_push() {
    echo "Changes detected, committing and pushing..."
    
    # Check if there are any changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        # Add all changes
        git add .
        
        # Create commit message with timestamp
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        git commit -m "auto: changes at $TIMESTAMP

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        # Push to main
        git push origin main
        
        echo "Auto-commit completed at $TIMESTAMP"
    else
        echo "No changes to commit"
    fi
}

# Initial check and commit any existing changes
auto_commit_and_push

echo "Starting auto-commit watcher for $WATCH_DIR..."
echo "Press Ctrl+C to stop"

# Watch for file changes using fswatch (macOS)
if command -v fswatch &> /dev/null; then
    fswatch -o "$WATCH_DIR" | while read f; do
        # Debounce - only commit if at least 5 seconds have passed
        CURRENT_TIME=$(date +%s)
        if [ $((CURRENT_TIME - LAST_COMMIT_TIME)) -gt 5 ]; then
            LAST_COMMIT_TIME=$CURRENT_TIME
            auto_commit_and_push
        fi
    done
else
    echo "fswatch not found. Please install it with: brew install fswatch"
    echo "Falling back to basic file monitoring..."
    
    # Fallback using find (less efficient)
    while true; do
        sleep 10
        auto_commit_and_push
    done
fi