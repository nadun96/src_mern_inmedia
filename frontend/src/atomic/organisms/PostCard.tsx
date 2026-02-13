import React, { useState } from "react";
import LikesSection from "./LikesSection";
import CommentsSection from "./CommentsSection";
import M from "materialize-css";
import { Button, Input } from "../atoms";
import { ImageUploader } from "../molecules";
import { uploadToCloudinary } from "../../utils/cloudinary";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  author: User;
}

interface PostCardProps {
  id: string;
  title: string;
  body: string;
  image: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  likedBy: User[];
  comments: Comment[];
  commentCount: number;
  currentUserId?: string;
  enableEdit?: boolean;
  onPostUpdate: () => void;
  onCommentUpdate?: (updatedPost: any) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  body,
  image,
  author,
  createdAt,
  likeCount,
  isLiked,
  likedBy,
  comments,
  commentCount,
  currentUserId,
  enableEdit = false,
  onPostUpdate,
  onCommentUpdate,
}) => {
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikedBy, setLocalLikedBy] = useState(likedBy);
  const [localComments, setLocalComments] = useState(comments);
  const [localCommentCount, setLocalCommentCount] = useState(commentCount);
  const [localTitle, setLocalTitle] = useState(title);
  const [localBody, setLocalBody] = useState(body);
  const [localImage, setLocalImage] = useState(image);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editBody, setEditBody] = useState(body);
  const [editImageUrl, setEditImageUrl] = useState(image);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleLikeChange = () => {
    if (localIsLiked) {
      setLocalLikeCount(localLikeCount - 1);
      setLocalLikedBy(localLikedBy.filter((u) => u.id !== currentUserId));
    } else {
      setLocalLikeCount(localLikeCount + 1);
      if (currentUserId) {
        const currentUser: User = {
          id: currentUserId,
          name: "You",
          email: "",
          createdAt: new Date().toISOString(),
        };
        setLocalLikedBy([currentUser, ...localLikedBy]);
      }
    }
    setLocalIsLiked(!localIsLiked);
  };

  const handleCommentAdded = () => {
    onPostUpdate();
  };

  const handleCommentsChanged = (
    updatedComments: any[],
    newCommentCount: number,
  ) => {
    setLocalComments(updatedComments);
    setLocalCommentCount(newCommentCount);

    // Notify parent with updated post data
    if (onCommentUpdate) {
      onCommentUpdate({
        id,
        title,
        body,
        image,
        author,
        createdAt,
        updatedAt: new Date().toISOString(),
        likeCount: localLikeCount,
        isLiked: localIsLiked,
        likedBy: localLikedBy,
        comments: updatedComments,
        commentCount: newCommentCount,
      });
    }
  };

  const isAuthor = !!currentUserId && author?.id === currentUserId;
  const canEdit = enableEdit && isAuthor;

  const handleEditStart = () => {
    setEditTitle(localTitle);
    setEditBody(localBody);
    setEditImageUrl(localImage);
    setEditImageFile(null);
    setEditImagePreview("");
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditImageFile(null);
    setEditImagePreview("");
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || !editBody.trim()) {
      M.toast({ html: "Title and content are required", classes: "red" });
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      M.toast({ html: "Please login first", classes: "red" });
      return;
    }

    try {
      setIsSaving(true);

      let finalImageUrl = editImageUrl;
      if (editImageFile) {
        M.toast({ html: "Uploading image...", classes: "blue" });
        finalImageUrl = await uploadToCloudinary(editImageFile);
      }

      const response = await fetch(`/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
          image: finalImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update post");
      }

      setLocalTitle(editTitle);
      setLocalBody(editBody);
      setLocalImage(finalImageUrl);
      setIsEditing(false);
      setEditImageFile(null);
      setEditImagePreview("");

      if (onCommentUpdate) {
        onCommentUpdate({
          id,
          title: editTitle,
          body: editBody,
          image: finalImageUrl,
          author,
          createdAt,
          updatedAt: new Date().toISOString(),
          likeCount: localLikeCount,
          isLiked: localIsLiked,
          likedBy: localLikedBy,
          comments: localComments,
          commentCount: localCommentCount,
        });
      }

      M.toast({ html: "Post updated", classes: "green" });
    } catch (error) {
      console.error("Error updating post:", error);
      M.toast({ html: "Failed to update post", classes: "red" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card home-card">
      {/* Post Header */}
      <div style={{ padding: "10px" }}>
        <h5 style={{ margin: "0" }}>
          <strong>{author?.name || "Anonymous"}</strong>
        </h5>
        <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
          {new Date(createdAt).toLocaleDateString()} at{" "}
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {canEdit && (
          <div style={{ marginTop: "8px" }}>
            {isEditing ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  color="blue"
                  onClick={handleEditSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  color="grey"
                  onClick={handleEditCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button color="blue" onClick={handleEditStart}>
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Post Image */}
      {localImage && (
        <div className="card-image">
          <img src={localImage} alt={localTitle} />
        </div>
      )}

      {/* Post Content */}
      <div className="card-content">
        {isEditing && canEdit ? (
          <div>
            <Input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="post title"
            />
            <Input
              type="text"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder="post content"
            />
            <ImageUploader
              label="Update Image"
              fileName={editImageFile?.name}
              previewUrl={editImagePreview}
              onFileChange={handleEditFileChange}
              disabled={isSaving}
              style={{ marginTop: "10px" }}
            />
          </div>
        ) : (
          <div>
            <h6>{localTitle}</h6>
            <p>{localBody}</p>
          </div>
        )}

        {/* Likes Section */}
        <LikesSection
          postId={id}
          likeCount={localLikeCount}
          isLiked={localIsLiked}
          likedBy={localLikedBy}
          onLikeChange={handleLikeChange}
          isLoggedIn={!!currentUserId}
        />

        {/* Comments Section */}
        <CommentsSection
          postId={id}
          comments={localComments}
          commentCount={localCommentCount}
          currentUserId={currentUserId}
          onCommentAdded={handleCommentAdded}
          onCommentsChanged={handleCommentsChanged}
        />
      </div>
    </div>
  );
};

export default PostCard;
