import React from "react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import { UserContext } from "../context/userContext";
import M from "materialize-css";

interface Post {
  id: string;
  title: string;
  body: string;
  image: string;
  authorId: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePicUrl?: string;
  followers: string[];
  following: string[];
  isFollowing?: boolean;
}

const Profile = () => {
  const { state, dispatch } = useContext(UserContext);
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === state?.id;
  const profileId = userId || state?.id;

  // Fetch user profile
  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("jwt");
    fetch(`/users/profile/${profileId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "red" });
        } else {
          setProfile(data);
          setIsFollowing(data.isFollowing || false);
        }
      })
      .catch((err) => console.error(err));
  }, [profileId]);

  // Fetch posts
  useEffect(() => {
    if (!profileId) return;

    const token = localStorage.getItem("jwt");
    fetch(`/posts/author?userId=${profileId}&page=1&limit=10`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [profileId]);

  const handleFollow = async () => {
    if (!profileId || !state) return;

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`/users/${profileId}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      setIsFollowing(true);
      if (profile) {
        setProfile({
          ...profile,
          followers: [...profile.followers, state.id],
        });
      }
      M.toast({ html: "Successfully followed user", classes: "green" });
    } catch (error) {
      console.error("Error following user:", error);
      M.toast({ html: "Failed to follow user", classes: "red" });
    }
  };

  const handleUnfollow = async () => {
    if (!profileId || !state) return;

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`/users/${profileId}/follow`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to unfollow user");
      }

      setIsFollowing(false);
      if (profile) {
        setProfile({
          ...profile,
          followers: profile.followers.filter((f) => f !== state.id),
        });
      }
      M.toast({ html: "Successfully unfollowed user", classes: "green" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      M.toast({ html: "Failed to unfollow user", classes: "red" });
    }
  };

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <img
            style={{ width: "166px", height: "166px", borderRadius: "83px" }}
            src={profile?.profilePicUrl || "https://via.placeholder.com/166"}
            alt="Profile"
          />
        </div>
        <div className="details-section">
          <h4>{profile ? profile.name : "Loading..."}</h4>
          <h5>{profile ? profile.email : "Loading..."}</h5>
          <div className="followings">
            <h6>{posts.length} posts</h6>
            <h6>{profile ? profile.followers.length : 0} followers</h6>
            <h6>{profile ? profile.following.length : 0} following</h6>
          </div>
          {!isOwnProfile && state && (
            <div style={{ marginTop: "15px" }}>
              {isFollowing ? (
                <button
                  className="btn waves-effect waves-light #c62828 red darken-3"
                  onClick={handleUnfollow}
                >
                  Unfollow
                </button>
              ) : (
                <button
                  className="btn waves-effect waves-light #6a1b9a purple darken-3"
                  onClick={handleFollow}
                >
                  Follow
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="posts">
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet</p>
        ) : (
          posts.map((post) => (
            <img
              src={post.image}
              className="post"
              alt={post.title}
              key={post.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
