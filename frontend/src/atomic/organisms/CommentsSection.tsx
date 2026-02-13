import React, { useState } from "react";
import M from "materialize-css";
import { ConfirmDialog } from "../molecules";
import api from "../../utils/api";

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
  onCommentsChanged?: (
    updatedComments: Comment[],
    newCommentCount: number,
  ) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  comments,
  commentCount,
  currentUserId,
  onCommentAdded,
  onCommentsChanged,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteCommentId, setPendingDeleteCommentId] = useState<
    string | null
  >(null);
  const [allComments, setAllComments] = useState<Comment[]>(comments);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      M.toast({ html: "Please enter a comment", classes: "red" });
      return;
    }

    if (!currentUserId) {
      M.toast({ html: "Please login to comment", classes: "red" });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: result } = await api.post("/comments", {
        postId,
        content: commentText,
      });

      // Add the new comment to the top of the list
      const updatedComments = [result.comment, ...allComments];
      setAllComments(updatedComments);
      setCommentText("");

      // Notify parent with updated comments
      if (onCommentsChanged) {
        onCommentsChanged(updatedComments, commentCount + 1);
      }
      onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
      M.toast({ html: "Failed to add comment", classes: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (
    commentId: string = pendingDeleteCommentId || "",
  ) => {
    if (!commentId) return;

    try {
      await api.delete(`/comments/${commentId}`);

      const updatedComments = allComments.filter((c) => c.id !== commentId);
      setAllComments(updatedComments);
      setShowDeleteConfirm(false);
      setPendingDeleteCommentId(null);

      // Notify parent with updated comments
      if (onCommentsChanged) {
        onCommentsChanged(updatedComments, Math.max(0, commentCount - 1));
      }
      onCommentAdded();
      M.toast({ html: "Comment deleted successfully", classes: "green" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      M.toast({ html: "Failed to delete comment", classes: "red" });
      setShowDeleteConfirm(false);
      setPendingDeleteCommentId(null);
    }
  };

  const openDeleteConfirm = (commentId: string) => {
    setPendingDeleteCommentId(commentId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteCommentId(null);
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
          {currentUserId ? (
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
          ) : (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                color: "#856404",
                fontSize: "14px",
              }}
            >
              <strong>Login to comment</strong> - Please sign in to share your
              thoughts
            </div>
          )}

          {/* Comments List */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {allComments.length > 0 ? (
              <>
                {/* Display limited or all comments */}
                {(showAllComments ? allComments : allComments.slice(0, 2)).map(
                  (comment) => (
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
                        <p
                          style={{
                            margin: "0",
                            fontSize: "11px",
                            color: "#999",
                          }}
                        >
                          {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {currentUserId === comment.authorId && (
                        <button
                          onClick={() => openDeleteConfirm(comment.id)}
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
                  ),
                )}

                {/* See More Button */}
                {!showAllComments && allComments.length > 2 && (
                  <button
                    onClick={() => setShowAllComments(true)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "10px",
                      backgroundColor: "transparent",
                      color: "#007bff",
                      border: "1px solid #007bff",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    See more ({allComments.length - 2} more{" "}
                    {allComments.length - 2 === 1 ? "comment" : "comments"})
                  </button>
                )}

                {/* See Less Button */}
                {showAllComments && allComments.length > 2 && (
                  <button
                    onClick={() => setShowAllComments(false)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      marginTop: "10px",
                      backgroundColor: "transparent",
                      color: "#007bff",
                      border: "1px solid #007bff",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    See less
                  </button>
                )}
              </>
            ) : (
              <p
                style={{ textAlign: "center", color: "#999", fontSize: "14px" }}
              >
                No comments yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Comment?"
          message="Are you sure you want to delete this comment? This cannot be undone."
          onConfirm={() => handleDeleteComment()}
          onCancel={closeDeleteConfirm}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </div>
  );
};

export default CommentsSection;
