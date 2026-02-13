import React, { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
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

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  commentCount: number;
  currentUserId?: string;
  onCommentAdded: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  comments,
  commentCount,
  currentUserId,
  onCommentAdded,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allComments, setAllComments] = useState<Comment[]>(comments);
  const [loadingAllComments, setLoadingAllComments] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    if (!currentUserId) {
      alert("Please login to comment");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("jwt");

      const response = await fetch("/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          content: commentText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const result = await response.json();

      // Add the new comment to the top of the list
      setAllComments([result.comment, ...allComments]);
      setCommentText("");
      onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadAllComments = async () => {
    if (allComments.length > 0 && allComments.length >= commentCount) {
      return; // Already loaded all
    }

    try {
      setLoadingAllComments(true);
      const response = await fetch(`/comments/${postId}?limit=100`);

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const result = await response.json();
      setAllComments(result.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingAllComments(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("jwt");

      const response = await fetch(`/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setAllComments(allComments.filter((c) => c.id !== commentId));
      onCommentAdded();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  return (
    <div
      style={{
        marginTop: "15px",
        borderTop: "1px solid #eee",
        paddingTop: "10px",
      }}
    >
      {/* Comments Toggle */}
      <div
        style={{
          cursor: "pointer",
          color: "#007bff",
          fontSize: "14px",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
        onClick={() => {
          setShowComments(!showComments);
          if (
            !showComments &&
            allComments.length === 0 &&
            comments.length > 0
          ) {
            setAllComments(comments);
          }
        }}
      >
        <i className="material-icons" style={{ fontSize: "18px" }}>
          {showComments ? "expand_less" : "expand_more"}
        </i>
        <span>
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comments List */}
      {showComments && (
        <div style={{ marginBottom: "10px" }}>
          {/* Comment Form */}
          <form
            onSubmit={handleSubmitComment}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
            }}
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "8px 16px",
                backgroundColor: isSubmitting ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {isSubmitting ? "..." : "Post"}
            </button>
          </form>

          {/* Comments List */}
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {allComments.length > 0 ? (
              allComments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: "0 0 5px 0",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {comment.author?.name || "Anonymous"}
                    </p>
                    <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                      {comment.content}
                    </p>
                    <p style={{ margin: "0", fontSize: "11px", color: "#999" }}>
                      {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {currentUserId === comment.authorId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "transparent",
                        color: "#dc3545",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "12px",
                        marginLeft: "10px",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p
                style={{ textAlign: "center", color: "#999", fontSize: "14px" }}
              >
                No comments yet
              </p>
            )}
          </div>

          {/* Load All Comments Button */}
          {allComments.length < commentCount && (
            <button
              onClick={handleLoadAllComments}
              disabled={loadingAllComments}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "10px",
                backgroundColor: "transparent",
                color: "#007bff",
                border: "1px solid #007bff",
                borderRadius: "4px",
                cursor: loadingAllComments ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              {loadingAllComments
                ? "Loading..."
                : `Load all ${commentCount} comments`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
