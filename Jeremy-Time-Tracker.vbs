Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.CurrentDirectory = scriptDir

' Check if node_modules exists, if not install dependencies
If Not objFSO.FolderExists(scriptDir & "\node_modules") Then
    ' Show a message that we're installing
    objShell.Popup "Installing dependencies for first run..." & vbCrLf & "This may take a moment.", 3, "Jeremy's Time Tracker", 64

    ' Install dependencies (hidden)
    objShell.Run "cmd /c npm install", 0, True
End If

' Start the application (completely hidden)
objShell.Run "cmd /c npm start", 0, False