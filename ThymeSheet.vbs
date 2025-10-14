Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.CurrentDirectory = scriptDir

' Check if node_modules exists, if not install dependencies
If Not objFSO.FolderExists(scriptDir & "\node_modules") Then
    ' Show detailed installation progress
    result = MsgBox("ThymeSheet needs to install dependencies for first run." & vbCrLf & vbCrLf & _
                   "This usually takes 3-5 minutes depending on your internet connection." & vbCrLf & vbCrLf & _
                   "Click OK to start installation, or Cancel to exit.", _
                   vbOKCancel + vbInformation, "ThymeSheet - First Time Setup")

    If result = vbCancel Then
        WScript.Quit
    End If

    ' Create a small HTML progress window
    Set objIE = CreateObject("InternetExplorer.Application")
    objIE.Navigate "about:blank"
    objIE.ToolBar = False
    objIE.StatusBar = False
    objIE.Width = 500
    objIE.Height = 200
    objIE.Left = 200
    objIE.Top = 200
    objIE.Visible = True

    ' Wait for IE to load
    Do While objIE.Busy
        WScript.Sleep 10
    Loop

    ' Create progress HTML
    progressHTML = "<html><head><title>ThymeSheet Setup</title>" & _
                   "<style>body{font-family:Arial;text-align:center;padding:20px;background:#f0f0f0;}" & _
                   ".progress{width:80%;height:20px;background:#ddd;border-radius:10px;margin:20px auto;}" & _
                   ".bar{height:100%;background:linear-gradient(90deg,#4CAF50,#45a049);border-radius:10px;width:0%;transition:width 0.3s;}" & _
                   "</style></head><body>" & _
                   "<h2>ThymeSheet - Installing Dependencies</h2>" & _
                   "<div class='progress'><div class='bar' id='progressBar'></div></div>" & _
                   "<p id='status'>Preparing installation...</p>" & _
                   "<p><small>This usually takes 3-5 minutes</small></p>" & _
                   "</body></html>"

    objIE.Document.Write progressHTML

    ' Update progress bar during install
    objIE.Document.getElementById("status").innerHTML = "Downloading Electron framework..."
    objIE.Document.getElementById("progressBar").style.width = "25%"

    ' Install dependencies
    Set objExec = objShell.Exec("cmd /c npm install")

    ' Monitor installation progress
    Do While objExec.Status = 0
        WScript.Sleep 1000
        ' Simulate progress updates
        If objIE.Document.getElementById("progressBar").style.width = "25%" Then
            objIE.Document.getElementById("status").innerHTML = "Installing packages..."
            objIE.Document.getElementById("progressBar").style.width = "50%"
        ElseIf objIE.Document.getElementById("progressBar").style.width = "50%" Then
            objIE.Document.getElementById("status").innerHTML = "Building native modules..."
            objIE.Document.getElementById("progressBar").style.width = "75%"
        End If
    Loop

    ' Installation complete
    objIE.Document.getElementById("status").innerHTML = "Installation complete!"
    objIE.Document.getElementById("progressBar").style.width = "100%"
    WScript.Sleep 1000

    ' Close progress window
    objIE.Quit
    Set objIE = Nothing

    ' Check if installation was successful
    If objExec.ExitCode <> 0 Then
        MsgBox "Installation failed. Please check your internet connection and try again.", vbCritical, "ThymeSheet Error"
        WScript.Quit
    End If
End If

' Start the application (completely hidden)
objShell.Run "cmd /c npm start", 0, False