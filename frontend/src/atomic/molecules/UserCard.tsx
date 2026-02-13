import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";

interface UserCardProps {
  userId: string;
  name: string;
  profilePicUrl?: string;
  subtitle?: string;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  userId,
  name,
  profilePicUrl,
  subtitle,
  actionLabel,
  actionDisabled = false,
  onAction,
}) => {
  return (
    <div
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
        to={`/profile/${userId}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "inherit",
          flex: 1,
        }}
      >
        <Avatar src={profilePicUrl} alt={name} size={40} />
        <div>
          <p style={{ margin: "0", fontWeight: "500" }}>{name}</p>
          {subtitle && (
            <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
              {subtitle}
            </p>
          )}
        </div>
      </Link>
      <Button
        color="purple"
        onClick={onAction}
        disabled={actionDisabled}
        style={{ padding: "6px 12px", fontSize: "12px" }}
      >
        {actionLabel}
      </Button>
    </div>
  );
};

export default UserCard;
