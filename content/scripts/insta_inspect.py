import instaloader


def list_to_txt(fname, data):
    data = sorted(data)
    with open(fname, "w") as file:
        data_to_write = "\n".join(data)

        # Write the data to the file
        file.write(data_to_write)


def insta_inspect(user_id, password, inspect_user_id):
    # Create an instance of Instaloader
    L = instaloader.Instaloader()

    # Login (optional)
    # If you want to download profile pictures of private users who follow you, you need to log in
    L.login(user_id, password)

    # Get your profile
    profile = instaloader.Profile.from_username(L.context, inspect_user_id)
    print(f"Is this profile private ? {profile.is_private}")

    followers = profile.get_followers()
    followees = profile.get_followees()

    followers_names = [o.username for o in followers]
    followees_names = [o.username for o in followees]
    print(f"Total followers: [{len(followers_names)}]")
    print(f"Total Following: [{len(followees_names)}]")

    u_not_following_others = [o for o in followers_names if o not in followees_names]
    other_not_following_u = [o for o in followees_names if o not in followers_names]
    print(f"Total u_not_following_others: [{len(u_not_following_others)}]")
    print(f"Total other_not_following_u : [{len(other_not_following_u)}]")

    # Save results to a text file
    list_to_txt("others_not_following_u.txt", other_not_following_u)
    list_to_txt("u_not_following_others.txt", u_not_following_others)
    print("Results are saved in text files")

    # Close the connection
    L.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 4:
        print("[Usage]: insta_inspect <user_id> <password> <inspect_user_id>")
        sys.exit(1)
    insta_inspect(sys.argv[1], sys.argv[2], sys.argv[3])
