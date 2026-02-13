import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  color?: "purple" | "blue" | "red" | "grey";
  size?: "normal" | "large";
  variant?: "raised" | "flat";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  ariaLabel?: string;
}

const colorClasses: Record<string, string> = {
  purple: "#6a1b9a purple darken-3",
  blue: "#64b5f6 blue darken-1",
  red: "#c62828 red darken-3",
  grey: "grey",
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  color = "blue",
  size = "normal",
  variant = "raised",
  disabled = false,
  type = "button",
  className = "",
  style,
  title,
  ariaLabel,
}) => {
  const baseClass =
    variant === "flat" ? "btn-flat" : "btn waves-effect waves-light";
  const sizeClass = size === "large" ? "btn-large" : "";
  const colorClass = variant === "flat" ? "" : colorClasses[color] || "";

  return (
    <button
      type={type}
      className={`${baseClass} ${sizeClass} ${colorClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
