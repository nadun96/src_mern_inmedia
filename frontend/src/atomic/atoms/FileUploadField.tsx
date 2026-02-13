import React from "react";

interface FileUploadFieldProps {
  label: string;
  fileName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  accept?: string;
  color?: "blue" | "purple";
  style?: React.CSSProperties;
}

const colorClasses: Record<string, string> = {
  blue: "#64b5f6 blue darken-1",
  purple: "#6a1b9a purple darken-3",
};

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  fileName = "",
  onChange,
  disabled = false,
  accept = "image/*",
  color = "blue",
  style,
}) => {
  return (
    <div className="file-field input-field" style={style}>
      <div className={`btn ${colorClasses[color]}`}>
        <span>{label}</span>
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="file-path-wrapper">
        <input
          className="file-path validate"
          type="text"
          value={fileName}
          readOnly
        />
      </div>
    </div>
  );
};

export default FileUploadField;
