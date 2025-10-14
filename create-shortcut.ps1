# Create desktop shortcut for fixed ThymeSheet executable
$WshShell = New-Object -comObject WScript.Shell
$shortcutPath = "$env:USERPROFILE\Desktop\ThymeSheet_Fixed.lnk"
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = (Resolve-Path "dist\win-unpacked\ThymeSheet.exe").Path
$Shortcut.WorkingDirectory = (Resolve-Path "dist\win-unpacked").Path
$Shortcut.IconLocation = (Resolve-Path "icon.ico").Path + ",0"
$Shortcut.Save()

Write-Host "Desktop shortcut created: ThymeSheet_Fixed.lnk"
Write-Host "Target: $($Shortcut.TargetPath)"
Write-Host "Icon: $($Shortcut.IconLocation)"