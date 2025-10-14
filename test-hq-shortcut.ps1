# Test high-quality ICO shortcut
$WshShell = New-Object -comObject WScript.Shell
$shortcutPath = "$env:USERPROFILE\Desktop\ThymeSheet_HQ.lnk"
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = (Resolve-Path "dist\win-unpacked\ThymeSheet.exe").Path
$Shortcut.WorkingDirectory = (Resolve-Path "dist\win-unpacked").Path
$Shortcut.IconLocation = (Resolve-Path "icon-hq.ico").Path + ",0"
$Shortcut.Save()

Write-Host "Created high-quality shortcut on desktop: ThymeSheet_HQ.lnk"
Write-Host "Compare this with the regular shortcut to see the quality difference!"