+++
title = "Instagram Followers Inspection"
+++


# Context

I always had the urge to find out people who had unfollowed me from instagram abruptly. 
But instagram dosen't give you any notifications or provide a nice way to know this info.
As of my knowledge (13-05-2024) we have to check each and every person from our followers list in our followees list to figure this out.
This is boring and tedious task to do.


# Problem

As a fun exercise, i thought of writing a small python script to figure this out. This blog is about how i achieved it.


# Solution

There is a python library called [**Instaloader**](https://instaloader.github.io/index.html) which is a tool to download pictures (or videos) along with their captions and other metadata from Instagram.
Im more interted in metadata part, we can directly extract the followers and followees list of the people you follow if you login into your user ID.

First we have to create an instaloader instance and then login using the our user ID and password

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

Using list comprehension magic, we can just compare the user names from followers and followees list 
to find out poeple who we don't follow back and people who dosen't follow us back !!

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

# Conclusion

- Full script is available on github [**insta_inspect.py**](https://github.com/Karthik-d-k/Karthik-d-k.github.io/blob/main/content/scripts/insta_inspect.py)
