import React from "react";
import "./Overlay.css";

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  variant?: "light" | "dark" | "medium";
  className?: string;
  zIndex?: number;
}

const Overlay: React.FC<OverlayProps> = ({
  children,
  onClose,
  variant = "light",
  className = "",
  zIndex,
}) => {
  return (
    <div
      className={`overlay overlay--${variant} ${className}`}
      onClick={onClose}
      style={zIndex ? { zIndex } : undefined}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

export default Overlay;
