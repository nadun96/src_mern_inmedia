import React from "react";
import Overlay from "../atoms/Overlay";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}) => {
  return (
    <Overlay onClose={onCancel}>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "4px",
          padding: "30px",
          maxWidth: "400px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h5 style={{ marginTop: "0", marginBottom: "20px" }}>{title}</h5>
        <p style={{ marginBottom: "20px", color: "#666" }}>{message}</p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Overlay>
  );
};

export default ConfirmDialog;
