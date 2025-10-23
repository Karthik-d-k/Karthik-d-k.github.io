+++
title = "Running asciinema from windows"
date = 2025-10-23
[taxonomies]
  tags = ["asciinema", "wsl", "windows"]
+++

As described in the [asciinema README](https://github.com/asciinema/asciinema), **asciinema** (aka asciinema CLI or asciinema recorder) is a command-line tool
for recording and live streaming terminal sessions.

Unlike typical *screen* recording software, which records visual output of a
screen into heavyweight video files (`.mp4`, `.mov`), asciinema CLI runs
*inside a terminal*, capturing terminal session output into lightweight
recording files in the [asciicast](https://docs.asciinema.org/manual/asciicast/v3/) format (`.cast`),
or streaming it live to viewers in real-time.

For now, it only supports GNU/Linux, macOS and FreeBSD.
Windows is currently not supported. See discussion [#278](https://github.com/orgs/asciinema/discussions/278).

As I have `WSL` installed on my Windows machine, I can run asciinema from the WSL terminal.
To make it run from PowerShell, I modified my PowerShell profile to add functions that call into the WSL asciinema binary.

```powershell
# Asciinema aliases using WSL
function asciinema { wsl ~/.cargo/bin/asciinema @args }
function record { wsl -d Ubuntu-22.04 ~/.cargo/bin/asciinema rec @args }
function play   { wsl -d Ubuntu-22.04 ~/.cargo/bin/asciinema play @args }
function stream { wsl -d Ubuntu-22.04 ~/.cargo/bin/asciinema stream @args }
```

This is the simplest way that I found to record PowerShell terminal sessions using asciinema.
I have no idea as of now if this is the best way to do it, but it works for me.