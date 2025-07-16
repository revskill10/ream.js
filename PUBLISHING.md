# Publishing Guide

This document explains how to set up and use the automated npm publishing workflow for ream.js.

## Overview

The library uses GitHub Actions to automatically publish to npm when a new GitHub release is created. This ensures:

- ✅ All tests pass before publishing
- ✅ Version consistency between git tags and package.json
- ✅ Automated and reliable publishing process
- ✅ No manual npm publish commands needed

## Setup Instructions

### 1. NPM Account Setup

1. Create an account on [npmjs.com](https://www.npmjs.com/) if you don't have one
2. Verify your email address
3. Enable two-factor authentication (recommended)

### 2. Generate NPM Access Token

1. Go to [npm Access Tokens](https://www.npmjs.com/settings/tokens)
2. Click "Generate New Token"
3. Choose "Automation" type (for CI/CD)
4. Copy the generated token (starts with `npm_`)

### 3. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm access token
6. Click "Add secret"

### 4. Verify Package Name

1. Check that the `name` field in `package.json` is unique on npm
2. Search on [npmjs.com](https://www.npmjs.com/) to verify availability
3. Update the name if needed (e.g., `@yourorg/ream.js` for scoped packages)

## Publishing Process

### 1. Prepare Release

1. Update version in `package.json`:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Commit the version change:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: bump version to v1.0.1"
   git push
   ```

### 2. Create GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.1` (must match package.json version)
4. Release title: `v1.0.1` or descriptive title
5. Add release notes describing changes
6. Click "Publish release"

### 3. Automated Publishing

The GitHub Action will automatically:

1. ✅ Run tests on Node.js 16, 18, and 20
2. ✅ Verify version consistency between tag and package.json
3. ✅ Build the package
4. ✅ Publish to npm

You can monitor the progress in the "Actions" tab of your repository.

## Workflow Files

### `.github/workflows/publish.yml`
- Triggers on GitHub releases
- Runs comprehensive tests
- Publishes to npm

### `.github/workflows/ci.yml`
- Runs on pull requests and pushes to main
- Ensures code quality before merging

## Troubleshooting

### Version Mismatch Error
If you see "Package version does not match tag version":
1. Ensure the git tag matches the version in package.json
2. Tag format should be `v1.0.1` for version `1.0.1`

### NPM Token Issues
If publishing fails with authentication errors:
1. Verify the `NPM_TOKEN` secret is set correctly
2. Check that the token has "Automation" permissions
3. Ensure the token hasn't expired

### Package Name Conflicts
If you get "package name already exists":
1. Choose a unique package name
2. Consider using a scoped package: `@yourorg/ream.js`
3. Update the `name` field in package.json

### Test Failures
If tests fail during publishing:
1. Run tests locally: `npm test`
2. Fix any failing tests
3. Create a new release after fixes

## Best Practices

1. **Always test locally** before creating a release
2. **Use semantic versioning** (major.minor.patch)
3. **Write meaningful release notes** to help users understand changes
4. **Keep the main branch stable** - only merge tested code
5. **Use draft releases** to prepare release notes before publishing

## Manual Publishing (Emergency)

If you need to publish manually:

```bash
# Build the package
npm run build

# Login to npm (one-time setup)
npm login

# Publish
npm publish
```

**Note**: Manual publishing bypasses the automated safety checks, so use with caution.
