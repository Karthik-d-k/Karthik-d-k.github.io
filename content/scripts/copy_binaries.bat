:: ---------------------------------------------------------
:: Batch script to copy binaries to given destination folder
:: ---------------------------------------------------------

@ECHO off

:: Change directory to script folder
CD %~dp0

:: Change destination folder to your need
SET dest=%cd%\_share

:: Extract PROJECT name
FOR %%F in ("%CD%") DO SET "PROJECT_name=%%~nxF"

:: Zip PROJECT contents
7z a ..\%PROJECT_name%.zip %cd%\

:: Set required files to copy to destination
SET zip=%CD%\..\%PROJECT_name%.zip
SET hex=%CD%\bin\%PROJECT_name%.hex
SET config=%CD%\gen\%PROJECT_name%.xml
:: etc ...

:: Copy files using xcopy
FOR %%F in (%zip%, %hex%, %config%) DO xcopy %%F %dest%\ /y

:: pause to see the stdout
pause

exit /b 0
