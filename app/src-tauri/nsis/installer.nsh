!macro NSIS_HOOK_POSTINSTALL
    nsExec::ExecToLog 'powershell -Command "$p=[Environment]::GetEnvironmentVariable(\"PATH\",\"User\"); if($p -notlike \"*$INSTDIR*\") { setx PATH \"$p;$INSTDIR\" }"'
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
    nsExec::ExecToLog 'powershell -Command "$p=[Environment]::GetEnvironmentVariable(\"PATH\",\"User\"); setx PATH ($p -replace [regex]::Escape(\"$INSTDIR\"),\"\")"'
!macroend