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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

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

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "inmedia");
    formData.append("cloud_name", "dkxb9gklg");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dkxb9gklg/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleProfilePhotoUpload = async () => {
    if (!profileImage) {
      M.toast({ html: "Please upload an image", classes: "red" });
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      M.toast({ html: "Please login first", classes: "red" });
      return;
    }

    try {
      setIsUploading(true);
      M.toast({ html: "Uploading image...", classes: "blue" });

      const imageUrl = await uploadToCloudinary(profileImage);

      const response = await fetch("/users/profile/photo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePicUrl: imageUrl }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update profile photo");
      }

      if (data.user?.profilePicUrl) {
        setProfile((prev) =>
          prev ? { ...prev, profilePicUrl: data.user.profilePicUrl } : prev,
        );

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser = {
            ...parsedUser,
            profilePicUrl: data.user.profilePicUrl,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          dispatch({ type: "USER", payload: updatedUser });
        }
      }

      setProfileImage(null);
      setProfileImagePreview("");
      setShowUploader(false);
      M.toast({ html: "Profile photo updated!", classes: "green" });
    } catch (error) {
      console.error("Error updating profile photo:", error);
      M.toast({ html: "Failed to update profile photo", classes: "red" });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoMenuOpen = () => {
    if (!profile?.profilePicUrl && !isOwnProfile) {
      return;
    }
    setShowPhotoMenu(true);
  };

  const handlePhotoMenuClose = () => {
    setShowPhotoMenu(false);
  };

  const handleViewPhoto = () => {
    setShowPhotoMenu(false);
    setShowPhotoViewer(true);
  };

  const handleUpdatePhoto = () => {
    setShowPhotoMenu(false);
    setShowUploader(true);
  };

  const handleCloseViewer = () => {
    setShowPhotoViewer(false);
  };

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <img
            className="profile-image"
            src={profile?.profilePicUrl || "https://via.placeholder.com/166"}
            alt="Profile"
            onClick={handlePhotoMenuOpen}
          />
          {showPhotoMenu && (
            <div className="photo-menu-overlay" onClick={handlePhotoMenuClose}>
              <div className="photo-menu" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn waves-effect waves-light #64b5f6 blue darken-1"
                  onClick={handleViewPhoto}
                >
                  View Photo
                </button>
                {isOwnProfile && (
                  <button
                    className="btn waves-effect waves-light #64b5f6 blue darken-1"
                    onClick={handleUpdatePhoto}
                  >
                    Update Photo
                  </button>
                )}
                <button
                  className="btn waves-effect waves-light grey"
                  onClick={handlePhotoMenuClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {showPhotoViewer && (
            <div className="photo-viewer-overlay" onClick={handleCloseViewer}>
              <img
                className="photo-viewer-image"
                src={
                  profile?.profilePicUrl || "https://via.placeholder.com/166"
                }
                alt="Profile"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {isOwnProfile && showUploader && (
            <div className="profile-upload">
              <div className="file-field input-field">
                <div className="btn #64b5f6 blue darken-1">
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileFileChange}
                    disabled={isUploading}
                  />
                </div>
                <div className="file-path-wrapper">
                  <input
                    className="file-path validate"
                    type="text"
                    value={profileImage?.name || ""}
                    readOnly
                  />
                </div>
              </div>
              {profileImagePreview && (
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="profile-preview"
                />
              )}
              <button
                className="btn waves-effect waves-light #64b5f6 blue darken-1"
                onClick={handleProfilePhotoUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Save Photo"}
              </button>
            </div>
          )}
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
