# Post-build script to force icon embedding in the executable
Write-Host "ThymeSheet - Post-Build Icon Embedding"
Write-Host "======================================="

$exePath = "dist\win-unpacked\ThymeSheet.exe"
$iconPath = "icon.ico"

if (-not (Test-Path $exePath)) {
    Write-Host "Error: ThymeSheet.exe not found at $exePath"
    exit 1
}

if (-not (Test-Path $iconPath)) {
    Write-Host "Error: Icon file not found at $iconPath"
    exit 1
}

Write-Host "Found executable: $exePath"
Write-Host "Found icon: $iconPath"

# Try to use rcedit from electron
try {
    $rceditPath = "node_modules\electron\dist\rcedit.exe"
    if (Test-Path $rceditPath) {
        Write-Host "Using rcedit to embed icon..."
        & $rceditPath $exePath --set-icon $iconPath
        Write-Host "Icon embedding completed with rcedit"
    } else {
        Write-Host "rcedit not found in expected location"
        Write-Host "Manual icon embedding may be required"
    }
} catch {
    Write-Host "Error during icon embedding: $_"
}

Write-Host ""
Write-Host "Creating desktop shortcut with explicit icon..."

# Create a shortcut with explicit icon reference
$shortcutPath = "$env:USERPROFILE\Desktop\ThymeSheet.lnk"
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = (Resolve-Path $exePath).Path
$Shortcut.WorkingDirectory = (Resolve-Path "dist\win-unpacked").Path
$Shortcut.IconLocation = (Resolve-Path $iconPath).Path + ",0"
$Shortcut.Save()

Write-Host "Created desktop shortcut with explicit icon reference"
Write-Host "Shortcut location: $shortcutPath"

Write-Host ""
Write-Host "Test the application:"
Write-Host "   1. Use the desktop shortcut created"
Write-Host "   2. Check if icons display correctly"
Write-Host "   3. If not, try running clear-icon-cache.bat"