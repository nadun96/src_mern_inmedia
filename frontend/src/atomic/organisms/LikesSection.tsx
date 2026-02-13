import React, { useState } from "react";
import M from "materialize-css";
import api from "../../utils/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface LikesSectionProps {
  postId: string;
  likeCount: number;
  isLiked: boolean;
  likedBy: User[];
  onLikeChange: () => void;
  isLoggedIn?: boolean;
}

const LikesSection: React.FC<LikesSectionProps> = ({
  postId,
  likeCount,
  isLiked,
  likedBy,
  onLikeChange,
  isLoggedIn = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showLikedBy, setShowLikedBy] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn) {
      M.toast({ html: "Please login to like posts", classes: "red" });
      return;
    }

    try {
      setLoading(true);

      if (isLiked) {
        // Unlike
        await api.delete(`/posts/${postId}/like`);
      } else {
        // Like
        await api.post(`/posts/${postId}/like`);
      }

      onLikeChange();
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={handleLike}
      >
        <i
          className="material-icons"
          style={{
            color: isLiked ? "red" : "#999",
            cursor: "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {isLiked ? "favorite" : "favorite_border"}
        </i>
        <span
          style={{
            color: isLiked ? "red" : "#333",
            fontWeight: isLiked ? "bold" : "normal",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (likeCount > 0) setShowLikedBy(!showLikedBy);
          }}
        >
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </span>
      </div>

      {showLikedBy && likedBy.length > 0 && (
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "8px",
            paddingLeft: "30px",
          }}
        >
          <p style={{ margin: "5px 0", fontWeight: "bold" }}>Liked by:</p>
          {likedBy.map((user) => (
            <p key={user.id} style={{ margin: "3px 0" }}>
              {user.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikesSection;
