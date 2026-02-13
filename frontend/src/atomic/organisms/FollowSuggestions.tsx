import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import M from "materialize-css";

interface SuggestedUser {
  id: string;
  name: string;
  email: string;
  profilePicUrl?: string;
  followerCount: number;
}

interface FollowSuggestionsProps {
  currentUserId?: string;
}

const FollowSuggestions: React.FC<FollowSuggestionsProps> = ({
  currentUserId,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("jwt");
    fetch("/users/suggestions/recommended?limit=5", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          setSuggestions(data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching suggestions:", err))
      .finally(() => setLoading(false));
  }, [currentUserId]);

  const handleFollow = async (userId: string) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(`/users/${userId}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      setFollowedUsers((prev) => new Set([...prev, userId]));
      M.toast({ html: "Successfully followed user", classes: "green" });

      // Remove from suggestions after following
      setSuggestions(suggestions.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error following user:", error);
      M.toast({ html: "Failed to follow user", classes: "red" });
    }
  };

  if (!currentUserId || loading) {
    return null;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h6
        style={{
          marginTop: "0",
          marginBottom: "15px",
          fontSize: "16px",
          fontWeight: "600",
          color: "#333",
        }}
      >
        Suggested For You
      </h6>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {suggestions.map((user) => (
          <div
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Link
              to={`/profile/${user.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                color: "inherit",
                flex: 1,
              }}
            >
              <img
                src={user.profilePicUrl || "https://via.placeholder.com/40"}
                alt={user.name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <p style={{ margin: "0", fontWeight: "500" }}>{user.name}</p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  {user.followerCount}{" "}
                  {user.followerCount === 1 ? "follower" : "followers"}
                </p>
              </div>
            </Link>
            <button
              onClick={() => handleFollow(user.id)}
              disabled={followedUsers.has(user.id)}
              className="btn waves-effect waves-light #6a1b9a purple darken-3"
              style={{
                padding: "6px 12px",
                fontSize: "12px",
              }}
            >
              {followedUsers.has(user.id) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowSuggestions;
