!include nsDialogs.nsh

Var hndl_DesktopShortcut
Var hndl_StartMenuShortcut
Var Checkbox_DesktopShortcut
Var Checkbox_StartMenuShortcut
Var Dialog

!macro customPageAfterChangeDir
  Page custom ShortcutOptionsPageShow ShortcutOptionsPageLeave
!macroend

Function ShortcutOptionsPageShow
  nsDialogs::Create 1018
  Pop $Dialog
  ${If} $Dialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 12u "Please choose which shortcuts to create:"
  Pop $0

  ${NSD_CreateCheckbox} 0 20u 100% 12u "Create Desktop shortcut"
  Pop $hndl_DesktopShortcut
  ${NSD_SetState} $hndl_DesktopShortcut ${BST_CHECKED}

  ${NSD_CreateCheckbox} 0 40u 100% 12u "Create Start Menu shortcut"
  Pop $hndl_StartMenuShortcut
  ${NSD_SetState} $hndl_StartMenuShortcut ${BST_UNCHECKED}

  nsDialogs::Show
FunctionEnd

Function ShortcutOptionsPageLeave
  ${NSD_GetState} $hndl_DesktopShortcut $Checkbox_DesktopShortcut
  ${NSD_GetState} $hndl_StartMenuShortcut $Checkbox_StartMenuShortcut
FunctionEnd

!macro customInstall
  ${If} $Checkbox_DesktopShortcut == 1
    CreateShortCut "$DESKTOP\Sub Sync.lnk" "$INSTDIR\Sub Sync.exe"
  ${EndIf}

  ${If} $Checkbox_StartMenuShortcut == 1
    CreateDirectory "$SMPROGRAMS\Sub Sync"
    CreateShortCut "$SMPROGRAMS\Sub Sync\Sub Sync.lnk" "$INSTDIR\Sub Sync.exe"
  ${EndIf}
!macroend

!macro customUnInstall
  Delete "$DESKTOP\Sub Sync.lnk"
  Delete "$SMPROGRAMS\Sub Sync\Sub Sync.lnk"
  RMDir "$SMPROGRAMS\Sub Sync"
!macroend
