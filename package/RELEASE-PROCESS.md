# Release Process

This project uses a `release` branch strategy for controlled npm publishing of the mini-todo-list-mcp package.

## Branch Strategy

- **`master`** - Main development branch, CI runs tests but no publishing
- **`release`** - Release branch, automatically publishes to npm when updated

## Publishing Workflow

### Option 1: Release Branch (Recommended)
```bash
# 1. Ensure master is ready for release
git checkout master
git pull origin master

# 2. Create/update release branch from master
git checkout release || git checkout -b release
git merge master

# 3. Push to release branch - this triggers automatic npm publish
git push origin release
```

### Option 2: Manual Trigger (For hotfixes)
1. Go to GitHub Actions → "Publish to NPM" 
2. Click "Run workflow"
3. Choose version bump type (patch/minor/major)
4. Click "Run workflow"

## What Happens Automatically

When you push to `release` branch:
- ✅ Runs all tests across multiple Node.js versions
- ✅ Builds the TypeScript project  
- ✅ Auto-bumps patch version (1.0.1 → 1.0.2)
- ✅ Creates git tag
- ✅ Publishes to npm with new README
- ✅ Updates package.json in release branch

## Version Strategy

- **Patch** (1.0.1): Bug fixes, documentation updates, small improvements
- **Minor** (1.1.0): New MCP tools, significant improvements  
- **Major** (2.0.0): Breaking changes, major rewrites

## Recommended Flow

```bash
# Regular development
git checkout master
# ... make changes, add tests, commit, push to master

# Ready to release?
git checkout release
git merge master
git push origin release  # 🚀 Auto-publishes to npm
```

## Prerequisites for Publishing

Before first publish, ensure you have:

1. **NPM Account**: Create account at https://www.npmjs.com
2. **NPM Token**: 
   - Go to https://www.npmjs.com/settings/tokens
   - Create "Automation" token
   - Add as `NPM_TOKEN` secret in GitHub repo settings
3. **Package Name Available**: Check https://www.npmjs.com/package/mini-todo-list-mcp

## MCP Server Testing

Before releasing, test the MCP server locally:

```bash
# Build the project
npm run build

# Test server startup
node dist/index.js

# Run comprehensive tests
npm run test:coverage
```

## Benefits

- ✅ **Controlled releases** - Only release when ready
- ✅ **Clean master** - Development doesn't trigger publishing
- ✅ **Automatic versioning** - No manual version management
- ✅ **Safe testing** - CI tests before every publish
- ✅ **Rollback friendly** - Can revert release branch if needed

## Emergency Rollback

If you need to unpublish or rollback:
```bash
# Revert release branch
git checkout release
git revert HEAD
git push origin release

# Or manually unpublish (within 72 hours, not recommended)
npm unpublish mini-todo-list-mcp@VERSION
```

## File Structure for NPM

The published package includes:
- `dist/` - Compiled JavaScript
- `README.md` - Concise user guide
- `package.json` - Package metadata
- `LICENSE` - MIT license

The comprehensive documentation (`README-full.md`) stays on GitHub only.