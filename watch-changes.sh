#!/bin/bash

# Function to commit changes
commit_changes() {
    # Get list of changed files
    changed_files=$(git status --porcelain | awk '{print $2}')
    
    if [ -n "$changed_files" ]; then
        echo "Changes detected in:"
        echo "$changed_files"
        
        # Add all changes
        git add .
        
        # Create commit with timestamp
        timestamp=$(date "+%Y-%m-%d %H:%M:%S")
        git commit -m "auto: changes at $timestamp"
        
        echo "Changes committed and pushed automatically"
    fi
}

# Watch for changes in the current directory
echo "Watching for file changes... (Press Ctrl+C to stop)"
fswatch -o . | while read; do
    commit_changes
done 