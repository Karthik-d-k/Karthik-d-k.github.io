+++
title = "Batch script for Copying Binaries"
date = 2024-07-02
[taxonomies]
  tags = ["batch", "script"]
+++


## Context

I got tired of manually copying the necessary files from the build project folder. Additionally, I had to copy the zipped project content to the destination folder every time I delivered a project. To streamline this process, I decided to automate the task using a Windows batch script as my development operating system is Windows.


## Problem

Write a windows batch script to automate zipping the content and also copying the files.


## Solution

I have `7-zip` installed in my machine so i use this tool to zip the contents and `xcopy`, an inbuilt tool in windows is used for copying the files.
I will explain each part of the script below.

First and foremost thing in batch scripts is to turn off outputting the commands run but for debugging purpose, we can comment-out/delete this line

```bat
@ECHO off
```

Change directory to the folder where the script is placed (ideally PROJECT root) using `%~dp0`, %0 refers to the batch file.
Set destination to new folder `_share` inside root directory or to any folder to your needs

```bat
CD %~dp0

SET dest=%cd%\_share
```

Next, extract the PROJECT folder name and zip its contents using `7-zip`.
I don't have clear understanding of how code line for extracting folder name works, this was made possible by googling and chatting with chatgpt for a day :)

```bat
FOR %%F in ("%CD%") DO SET "PROJECT_name=%%~nxF"

7z a ..\%PROJECT_name%.zip %cd%\
```

Set all the required files that you want to copy using `SET` and copy using `xcopy`.
`/y` option is used to accept to copy the files by default.

```bat
SET zip=%CD%\..\%PROJECT_name%.zip
SET hex=%CD%\bin\%PROJECT_name%.hex
SET config=%CD%\gen\%PROJECT_name%.xml
:: etc ...

:: Copy files using xcopy
FOR %%F in (%zip%, %hex%, %config%) DO xcopy %%F %dest%\ /y
```

Use `pause` before exiting the program, so that you can see which files are copied in the standard output window

```bat
:: pause to see the stdout
pause

exit /b 0
```


## Conclusion

- Full script is available on github [**copy_binaries.bat**](https://github.com/Karthik-d-k/Karthik-d-k.github.io/blob/main/content/scripts/copy_binaries.bat)
