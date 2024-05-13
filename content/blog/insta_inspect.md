+++
title = "Instagram Followers Inspection"
+++


## Context

I've always had the urge to find out people who had unfollowed me from instagram abruptly. 
However, instagram dosen't provide notifications or an easy way to know access this info.
As of my knowledge on May 13, 2024, we still have to manually check each and every person from our followers list in our followees list to figure this out.
It's boring and tedious task.


## Problem

As a fun exercise, I thought of writing a small python script to figure this out. This blog is about how I achieved it.


## Solution

There is a python library called [**Instaloader**](https://instaloader.github.io/index.html) which is a tool for downloading pictures (or videos) along with their captions and other metadata from Instagram.
I'm more interested in metadata part. we can directly extract the followers and followees list of the people you follow if you login into your user ID.

First, we have to create an instaloader instance and then login using our user ID and password

```python
import instaloader

L = instaloader.Instaloader()
L.login(<user_id>, <password>)
```

Then we can extract anyone's profile from our followers list or we can create our own profile

```python
profile = instaloader.Profile.from_username(L.context, <inspect_user_id>)
```

We can just extract the list of followers and followees using this profile instance

```python
followers = profile.get_followers()
followees = profile.get_followees()
```

Using list comprehension magic, we can simply compare the usernames from the followers and followees list 
to find out poeple who we don't follow back and people who don't follow us back !!

```python
followers_names = [o.username for o in followers]
followees_names = [o.username for o in followees]

u_not_following_others = [o for o in followers_names if o not in followees_names]
other_not_following_u = [o for o in followees_names if o not in followers_names]
```

Finally, we can just save these results in a text file using following simple code and close the connection

```python
def list_to_txt(fname, data):
    data = sorted(data)
    with open(fname, "w") as file:
        data_to_write = "\n".join(data)

        # Write the data to the file
        file.write(data_to_write)

# Save results to a text file
list_to_txt("others_not_following_u.txt", other_not_following_u)
list_to_txt("u_not_following_others.txt", u_not_following_others)

# Close the connection
L.close()
```

## Conclusion

- Full script is available on github [**insta_inspect.py**](https://github.com/Karthik-d-k/Karthik-d-k.github.io/blob/main/content/scripts/insta_inspect.py)

- Thanks to my friend [**Apoorva Bhat**](https://www.linkedin.com/in/apoorva-bhat-6ab836171/) for reviewing the draft version of this blog.
