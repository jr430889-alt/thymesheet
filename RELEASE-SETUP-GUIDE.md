# ThymeSheet Auto-Update Setup Guide

This guide explains how to set up automatic updates for ThymeSheet using GitHub Releases.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. A GitHub Personal Access Token (for publishing releases)

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top-right corner and select **New repository**
3. Repository settings:
   - **Repository name**: `thymesheet` (or your preferred name)
   - **Description**: "ThymeSheet - Professional time tracking application"
   - **Visibility**: Can be Public or Private (both work with releases)
4. Click **Create repository**

## Step 2: Update package.json

In your `package.json` file, replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```json
"publish": {
  "provider": "github",
  "owner": "YOUR_ACTUAL_GITHUB_USERNAME",
  "repo": "thymesheet"
}
```

**Important**: If you named your repository something other than "thymesheet", update the `"repo"` value accordingly.

## Step 3: Create a GitHub Personal Access Token

You need a token to allow electron-builder to publish releases to GitHub.

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Direct link: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Token settings:
   - **Note**: "ThymeSheet Release Publisher"
   - **Expiration**: Choose "No expiration" or set a long expiration
   - **Scopes**: Check the box for `repo` (Full control of private repositories)
4. Click **Generate token**
5. **IMPORTANT**: Copy the token immediately (you won't be able to see it again!)

## Step 4: Set Up the GitHub Token on Your Computer

You need to store the token as an environment variable so electron-builder can use it.

### Option A: Set Permanently (Recommended)

1. Press `Win + X` and select **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under **User variables**, click **New**
5. Variable settings:
   - **Variable name**: `GH_TOKEN`
   - **Variable value**: Paste your GitHub token
6. Click **OK** on all dialogs
7. **Restart any open command prompts or VS Code** for the change to take effect

### Option B: Set Temporarily (For One Session)

In your command prompt, run:
```cmd
set GH_TOKEN=your_github_token_here
```

Note: You'll need to do this every time you open a new command prompt.

## Step 5: Initialize Git Repository (If Not Already Done)

```cmd
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thymesheet.git
git push -u origin main
```

## Step 6: Create Your First Release

### A. Update Version Number

Before each release, update the version in `package.json`:
```json
"version": "2.0.0"
```

Use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features (2.0.0 → 2.1.0)
- **PATCH**: Bug fixes (2.1.0 → 2.1.1)

### B. Commit Your Changes

```cmd
git add .
git commit -m "Release v2.0.0: Initial release with auto-update support"
git push
```

### C. Build and Publish

Run the publish command:
```cmd
npm run publish-release
```

This will:
1. Build the Windows installer
2. Create a draft release on GitHub
3. Upload the installer and update files to GitHub

### D. Publish the Release on GitHub

1. Go to your repository on GitHub
2. Click on **Releases** (right sidebar)
3. You'll see a draft release - click **Edit**
4. Add release notes describing what's new (e.g., "Initial release with time tracking features")
5. Click **Publish release**

## Step 7: Test Auto-Update

### Testing with a New Version

1. Update version in `package.json` (e.g., from `2.0.0` to `2.0.1`)
2. Make some changes to your app
3. Commit and push:
   ```cmd
   git add .
   git commit -m "Release v2.0.1: Bug fixes and improvements"
   git push
   ```
4. Publish new release:
   ```cmd
   npm run publish-release
   ```
5. Publish the release on GitHub
6. Open the old version of ThymeSheet - it should detect the update within a few seconds!

## How Auto-Update Works for Users

1. **User opens ThymeSheet**: App checks for updates automatically
2. **Update available**: Blue banner appears at top with version info
3. **User clicks "Download Update"**: Progress bar shows download status
4. **Download complete**: Banner shows "Restart & Update" button
5. **User clicks "Restart & Update"**: App closes, installs update, and reopens
6. **User data preserved**: All time entries and projects remain intact (stored in `Documents\ThymeSheet`)

## Troubleshooting

### Error: "Cannot find GitHub token"
- Make sure you set the `GH_TOKEN` environment variable
- Restart your command prompt/IDE after setting the variable

### Error: "Repository not found"
- Check that the owner and repo names in `package.json` match your GitHub repository
- Verify your GitHub token has `repo` permissions

### Updates not detected
- Make sure the new version number is higher than the current version
- Check that the release is published (not draft) on GitHub
- Look in the app's DevTools console for error messages

### Users on older versions
- Users need to install version 2.0.0+ to get auto-update functionality
- Earlier versions won't check for updates (they need to manually download the new installer)

## Best Practices

1. **Always test locally** before publishing a release
2. **Write clear release notes** so users know what changed
3. **Use semantic versioning** consistently
4. **Keep the token secure** - never commit it to your repository
5. **Create releases from the main branch** to avoid confusion

## Files Generated by electron-builder

When you run `npm run publish-release`, these files are created in the `dist` folder:

- `ThymeSheet Setup 2.0.0.exe` - The installer users download
- `latest.yml` - Update metadata file (tells the app about new versions)
- Other files for the update process

All these files are automatically uploaded to GitHub Releases.

## Need Help?

If you run into issues:
1. Check the console output when running `npm run publish-release`
2. Look at the DevTools console in your app (uncomment the line in main.js that opens DevTools)
3. Verify your GitHub token is valid and has the right permissions
