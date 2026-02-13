import React from "react";

interface InputProps {
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  id,
  name,
  style,
  readOnly,
  className,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      id={id}
      name={name}
      style={style}
      readOnly={readOnly}
      className={className}
    />
  );
};

export default Input;
