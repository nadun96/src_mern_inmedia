import React, { useState } from "react";
import LikesSection from "./LikesSection";
import CommentsSection from "./CommentsSection";

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
  onPostUpdate: () => void;
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
  onPostUpdate,
}) => {
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikedBy, setLocalLikedBy] = useState(likedBy);

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
      </div>

      {/* Post Image */}
      {image && (
        <div className="card-image">
          <img src={image} alt={title} />
        </div>
      )}

      {/* Post Content */}
      <div className="card-content">
        <h6>{title}</h6>
        <p>{body}</p>

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
          comments={comments}
          commentCount={commentCount}
          currentUserId={currentUserId}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  );
};

export default PostCard;
