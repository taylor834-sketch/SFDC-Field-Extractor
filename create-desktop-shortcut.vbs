Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\Salesforce Field Analyzer.lnk"

Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = WScript.ScriptFullName
oLink.Arguments = ""
oLink.WorkingDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
oLink.Description = "Launch Salesforce Field Analyzer"
oLink.IconLocation = "C:\Windows\System32\shell32.dll,165"
oLink.Save

' Get the current directory
strCurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Create the actual shortcut that runs start.bat
sLinkFile2 = oWS.SpecialFolders("Desktop") & "\Salesforce Field Analyzer.lnk"
Set oLink2 = oWS.CreateShortcut(sLinkFile2)
oLink2.TargetPath = strCurrentDir & "\start.bat"
oLink2.WorkingDirectory = strCurrentDir
oLink2.Description = "Launch Salesforce Field Analyzer"
oLink2.IconLocation = "C:\Windows\System32\shell32.dll,165"
oLink2.Save

MsgBox "Desktop shortcut created successfully!" & vbCrLf & vbCrLf & "You can now double-click 'Salesforce Field Analyzer' on your desktop to launch the app.", vbInformation, "Shortcut Created"
