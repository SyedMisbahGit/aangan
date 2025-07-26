#!/bin/bash

# Git Update Script for Security Enhancements
# This script stages, commits, and pushes security updates to the main branch

# Set branch name
BRANCH="main"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git and try again."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ] && [ "$(git rev-parse --is-inside-work-tree 2>/dev/null)" != "true" ]; then
    echo "Error: Not a git repository. Please run this script from the root of your repository."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    # Add all changes
    git add .
    
    # Commit with a descriptive message
    git commit -m "feat(security): implement rate limiting and Redis integration

- Add Redis-based rate limiting middleware
- Implement request tracking and analytics
- Add security headers and input validation
- Update documentation for security features
- Add SECURITY.md with security policies"
    
    # Pull latest changes to avoid conflicts
    git pull origin "$BRANCH" --rebase
    
    # Push changes
    if git push origin "$BRANCH"; then
        echo "✅ Successfully pushed security updates to $BRANCH branch"
    else
        echo "❌ Failed to push changes. Please resolve any conflicts and try again."
        exit 1
    fi
else
    echo "No changes to commit. Your working directory is clean."
fi
