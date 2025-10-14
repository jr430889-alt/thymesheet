$action = New-ScheduledTaskAction -Execute "$PSScriptRoot\auto-save.bat"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30)
Register-ScheduledTask -TaskName "ThymeSheet Auto-Save" -Action $action -Trigger $trigger -RunLevel Highest -Force
Write-Host "Auto-save task created successfully!"
Read-Host "Press Enter to close"
