# Enable Developer Mode to Fix Build Issues

The installer build is failing because Windows needs special permissions to create symbolic links, even with administrator privileges.

## Solution: Enable Developer Mode

1. Press `Windows + I` to open Settings
2. Go to **"Privacy & Security"** → **"For developers"**
3. Turn ON **"Developer Mode"**
4. Restart your computer
5. Run `build-installer.bat` as administrator again

## What This Does

Developer Mode allows applications to create symbolic links without requiring elevated permissions for each operation.

## After Enabling

Once Developer Mode is enabled and you've restarted, the build should complete successfully and create **ThymeSheet Setup 2.0.0.exe** in the `dist` folder.
