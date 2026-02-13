import React from "react";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";
import { UserContext } from "../../context/userContext";
import M from "materialize-css";
import { Avatar, Button, Input, Overlay } from "../atoms";
import { ImageUploader } from "../molecules";
import { uploadToCloudinary } from "../../utils/cloudinary";

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
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState("");
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isPostDeleting, setIsPostDeleting] = useState(false);

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

  const handlePostClick = (post: Post) => {
    if (!isOwnProfile) {
      return;
    }
    setSelectedPost(post);
    setPostTitle(post.title);
    setPostBody(post.body);
    setPostImageUrl(post.image);
    setPostImageFile(null);
    setPostImagePreview("");
    setShowPostEditor(true);
  };

  const handlePostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostEditorClose = () => {
    setShowPostEditor(false);
    setSelectedPost(null);
    setPostImageFile(null);
    setPostImagePreview("");
  };

  const handlePostSave = async () => {
    if (!selectedPost) {
      return;
    }

    if (!postTitle.trim() || !postBody.trim()) {
      M.toast({ html: "Title and content are required", classes: "red" });
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      M.toast({ html: "Please login first", classes: "red" });
      return;
    }

    try {
      setIsPostSaving(true);

      let finalImageUrl = postImageUrl;
      if (postImageFile) {
        M.toast({ html: "Uploading image...", classes: "blue" });
        finalImageUrl = await uploadToCloudinary(postImageFile);
      }

      const response = await fetch(`/posts/${selectedPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: postTitle,
          body: postBody,
          image: finalImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update post");
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost.id
            ? {
                ...post,
                title: postTitle,
                body: postBody,
                image: finalImageUrl,
              }
            : post,
        ),
      );

      setShowPostEditor(false);
      setSelectedPost(null);
      setPostImageFile(null);
      setPostImagePreview("");
      M.toast({ html: "Post updated", classes: "green" });
    } catch (error) {
      console.error("Error updating post:", error);
      M.toast({ html: "Failed to update post", classes: "red" });
    } finally {
      setIsPostSaving(false);
    }
  };

  const handlePostDelete = async () => {
    if (!selectedPost) {
      return;
    }

    await handlePostDeleteById(selectedPost.id);
  };

  const handlePostDeleteById = async (postId: string) => {
    if (!postId) {
      return;
    }

    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      M.toast({ html: "Please login first", classes: "red" });
      return;
    }

    try {
      setIsPostDeleting(true);

      const response = await fetch(`/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setShowPostEditor(false);
      setSelectedPost(null);
      setPostImageFile(null);
      setPostImagePreview("");
      M.toast({ html: "Post deleted", classes: "green" });
    } catch (error) {
      console.error("Error deleting post:", error);
      M.toast({ html: "Failed to delete post", classes: "red" });
    } finally {
      setIsPostDeleting(false);
    }
  };

  return (
    <div className="main-container">
      <div className="profile-container">
        <div>
          <Avatar
            src={profile?.profilePicUrl || "https://via.placeholder.com/166"}
            alt="Profile"
            size={166}
            onClick={handlePhotoMenuOpen}
            className="profile-image"
          />
          {showPhotoMenu && (
            <Overlay onClose={handlePhotoMenuClose}>
              <div className="photo-menu">
                <Button color="blue" onClick={handleViewPhoto}>
                  View Photo
                </Button>
                {isOwnProfile && (
                  <Button color="blue" onClick={handleUpdatePhoto}>
                    Update Photo
                  </Button>
                )}
                <Button color="grey" onClick={handlePhotoMenuClose}>
                  Cancel
                </Button>
              </div>
            </Overlay>
          )}
          {showPhotoViewer && (
            <Overlay variant="dark" onClose={handleCloseViewer}>
              <img
                className="photo-viewer-image"
                src={
                  profile?.profilePicUrl || "https://via.placeholder.com/166"
                }
                alt="Profile"
              />
            </Overlay>
          )}
          {isOwnProfile && showUploader && (
            <div className="profile-upload">
              <ImageUploader
                label="Upload Photo"
                fileName={profileImage?.name}
                previewUrl={profileImagePreview}
                onFileChange={handleProfileFileChange}
                disabled={isUploading}
                previewClassName="profile-preview"
              />
              <Button
                color="blue"
                onClick={handleProfilePhotoUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Save Photo"}
              </Button>
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
                <Button color="red" onClick={handleUnfollow}>
                  Unfollow
                </Button>
              ) : (
                <Button color="purple" onClick={handleFollow}>
                  Follow
                </Button>
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
            <div
              className={`post-item ${isOwnProfile ? "editable" : ""}`}
              key={post.id}
              onClick={() => handlePostClick(post)}
            >
              <img src={post.image} className="post" alt={post.title} />
              {isOwnProfile && (
                <button
                  className="post-delete-icon btn-flat"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePostDeleteById(post.id);
                  }}
                  aria-label="Delete post"
                  title="Delete post"
                >
                  <i className="material-icons">delete</i>
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {showPostEditor && selectedPost && (
        <Overlay variant="medium" onClose={handlePostEditorClose} zIndex={1100}>
          <div className="post-editor">
            <h5>Edit Post</h5>
            <Input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="post title"
            />
            <Input
              type="text"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="post content"
            />
            <ImageUploader
              label="Update Image"
              fileName={postImageFile?.name}
              previewUrl={postImagePreview || postImageUrl}
              onFileChange={handlePostFileChange}
              disabled={isPostSaving}
              style={{ marginTop: "10px" }}
              previewClassName="post-edit-preview"
            />
            <div className="post-editor-actions">
              <Button
                variant="flat"
                className="post-delete-button"
                onClick={handlePostDelete}
                disabled={isPostSaving || isPostDeleting}
                ariaLabel="Delete post"
                title="Delete post"
              >
                <i className="material-icons">delete</i>
              </Button>
              <Button
                color="blue"
                onClick={handlePostSave}
                disabled={isPostSaving || isPostDeleting}
              >
                {isPostSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                color="grey"
                onClick={handlePostEditorClose}
                disabled={isPostSaving || isPostDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default Profile;
