import React from "react";
import FileUploadField from "../atoms/FileUploadField";

interface ImageUploaderProps {
  label: string;
  fileName?: string;
  previewUrl?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  previewStyle?: React.CSSProperties;
  previewClassName?: string;
  style?: React.CSSProperties;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  fileName = "",
  previewUrl,
  onFileChange,
  disabled = false,
  previewStyle,
  previewClassName,
  style,
}) => {
  return (
    <div style={style}>
      <FileUploadField
        label={label}
        fileName={fileName}
        onChange={onFileChange}
        disabled={disabled}
      />
      {previewUrl && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={previewUrl}
            alt="Preview"
            className={previewClassName}
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "4px",
              ...previewStyle,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
