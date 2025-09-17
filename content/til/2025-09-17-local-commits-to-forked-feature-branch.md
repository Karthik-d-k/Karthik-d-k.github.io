+++
title = "Local commits to forked feature branch"
date = 2025-09-17
[taxonomies]
  tags = ["git"]
+++

### Problem Statement

A local clone of a GitHub repository contains uncommitted modifications. The objective is to fork the original repository to a personal GitHub account, 
configure the fork as the primary remote, and ensure changes are pushed to a new feature branch rather than the `master` branch. 
This setup keeps master clean and aligned with the original repository while isolating custom work in a `dedicated branch`.

---

### 1. Fork the repo on GitHub

* Go to the **original repo’s page** on GitHub.
* Click **Fork** (top-right).
* This creates a fork under your GitHub account.


### 2. Add your fork as a remote

In your local repo, add your fork as `origin`:

```bash
git remote set-url origin git@github.com:<your-username>/<forked-repo>.git
```

> Use HTTPS instead of SSH if that’s how you cloned.

### 3. Keep the original repo as `upstream`:

```bash
git remote add upstream git@github.com:<original-owner>/<original-repo>.git
```

Verify remotes:

```bash
git remote -v
```

You should see:

* `origin` → your fork
* `upstream` → original repo


### 4. Commit your changes (if not already)

Check status:

```bash
git status
```

If you have uncommitted changes:

```bash
git add .
git commit -m "Your message"
```



### 5. Create a new branch for your changes

Instead of pushing to `master`, create a new branch:

```bash
git checkout -b my-feature-branch
```



### 6. Push new branch to your fork

Push this branch to your fork (`origin`):

```bash
git push origin my-feature-branch
```



### 7. Keep master clean

Make sure your local `master` tracks the original repo:

```bash
git checkout master
git fetch upstream
git reset --hard upstream/master
git push origin master --force   # keep fork’s master in sync
```
### 8. Remove the original repo remote

If you no longer want the **original repo** (`upstream`) connected to your local repo, you can simply remove it:

```bash
git remote remove upstream
```

Check your remotes again:

```bash
git remote -v
```

Now you should only see your **fork (`origin`)**.


## References

- [ChatGPT](https://chatgpt.com/)
