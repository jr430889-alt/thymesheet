const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

/**
 * Electron-builder afterPack hook to automatically embed icon and create desktop shortcut
 * This runs after the app is packaged but before the installer is created
 */
exports.default = async function(context) {
    const { electronPlatformName, appOutDir } = context;

    // Only run on Windows builds
    if (electronPlatformName !== 'win32') {
        return;
    }

    const exePath = path.join(appOutDir, 'ThymeSheet.exe');
    const iconPath = path.join(context.packager.projectDir, 'icon.ico');
    const hqIconPath = path.join(context.packager.projectDir, 'icon-hq.ico');
    const pngIconPath = path.join(context.packager.projectDir, 'images', 'ThymeSheetImage.png');

    // Create high-quality ICO file if it doesn't exist
    if (!fs.existsSync(hqIconPath)) {
        console.log('🎨 Creating high-quality ICO file...');
        try {
            const toIco = require('to-ico');
            const sharp = require('sharp');
            const input = fs.readFileSync(pngIconPath);
            const buffers = await Promise.all([
                sharp(input).resize(16, 16).png().toBuffer(),
                sharp(input).resize(32, 32).png().toBuffer(),
                sharp(input).resize(48, 48).png().toBuffer(),
                sharp(input).resize(64, 64).png().toBuffer(),
                sharp(input).resize(128, 128).png().toBuffer(),
                sharp(input).resize(256, 256).png().toBuffer()
            ]);
            const ico = await toIco(buffers);
            fs.writeFileSync(hqIconPath, ico);
            console.log('✅ High-quality ICO created!');
        } catch (error) {
            console.error('❌ Failed to create high-quality ICO:', error.message);
        }
    }

    console.log('🔧 Post-build: Embedding icon into executable...');
    console.log(`   Executable: ${exePath}`);
    console.log(`   Icon: ${iconPath}`);

    try {
        await rcedit(exePath, { icon: iconPath });
        console.log('✅ Icon embedded successfully!');
    } catch (error) {
        console.error('❌ Failed to embed icon:', error.message);
        // Don't fail the build, just warn
    }

    // Create desktop shortcut with high-quality PNG icon
    console.log('🔗 Creating desktop shortcut with high-quality ICO icon...');
    try {
        const { execSync } = require('child_process');

        // Create a temporary PowerShell script file to avoid escaping issues
        const psScriptPath = path.join(context.packager.projectDir, 'build-scripts', 'create-shortcut-temp.ps1');
        const psScript = `# Temporary script for creating desktop shortcut
$WshShell = New-Object -comObject WScript.Shell
$shortcutPath = "$env:USERPROFILE\\Desktop\\ThymeSheet.lnk"
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = "${exePath}"
$Shortcut.WorkingDirectory = "${appOutDir}"
$Shortcut.IconLocation = "${hqIconPath},0"
$Shortcut.Save()
Write-Host "Desktop shortcut created with high-quality ICO"`;

        fs.writeFileSync(psScriptPath, psScript);

        const result = execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { encoding: 'utf8' });
        console.log(`   ${result.trim()}`);

        // Clean up temp script
        fs.unlinkSync(psScriptPath);

        console.log('✅ Desktop shortcut created with high-quality ICO icon!');
    } catch (error) {
        console.error('❌ Failed to create desktop shortcut:', error.message);
        // Don't fail the build, just warn
    }
};