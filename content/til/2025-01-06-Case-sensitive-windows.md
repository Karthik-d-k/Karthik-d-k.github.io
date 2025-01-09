+++
title = "Case-sensitive Settings on Windows"
date = 2025-01-06
[taxonomies]
  tags = ["os", "windows"]
+++

- I was trying to clone the **Linux** git stable repository on my Windows 10 machine using the following command:

    ```bash
    git clone https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git --depth 1
    ```
- Unfortunately, this failed with the following warning because the Linux tree contains files with the same name but with different case sensitivity:

    ```bash
    warning: the following paths have collided (e.g. case-sensitive paths
    on a case-insensitive filesystem) and only one from the same
    colliding group is in the working tree:
    ...
    ```
- The Windows 10 file system by default is **case-insensitive**, meaning it treats both **ip6t_hl.h** and **ip6t_HL.h** as the same file. This is not true for Linux file systems, as they treat these as different files because the file system is case-sensitive.
- This problem can be solved in two ways:
    - We can use **WSL (Windows Subsystem for Linux)** on our Windows machine.
    - We can enable case sensitivity for a folder using the **fsutil** command:
        ```bash
        fsutil file setCaseSensitiveInfo "<path-to-directory>" enable
        ```
        - You can verify if this worked using the following command:
            ```bash
            fsutil.exe file queryCaseSensitiveInfo "<path-to-directory>"
            ```

## References

- [Stack Overflow: Case-sensitive path collisions](https://stackoverflow.com/a/64466310)
