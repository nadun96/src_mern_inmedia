import React, { useState, useEffect } from "react";
import M from "materialize-css";
import { UserCard } from "../molecules";
import api from "../../utils/api";

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

    api
      .get("/users/suggestions/recommended?limit=5")
      .then(({ data }) => {
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
      await api.post(`/users/${userId}/follow`);

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
          <UserCard
            key={user.id}
            userId={user.id}
            name={user.name}
            profilePicUrl={user.profilePicUrl}
            subtitle={`${user.followerCount} ${user.followerCount === 1 ? "follower" : "followers"}`}
            actionLabel={followedUsers.has(user.id) ? "Following" : "Follow"}
            actionDisabled={followedUsers.has(user.id)}
            onAction={() => handleFollow(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FollowSuggestions;
