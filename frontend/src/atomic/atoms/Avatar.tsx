import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const Avatar: React.FC<AvatarProps> = ({
  src = "https://via.placeholder.com/40",
  alt = "Avatar",
  size = 40,
  onClick,
  className = "",
  style,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      onClick={onClick}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        objectFit: "cover",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    />
  );
};

export default Avatar;
