import { ReactNode } from "react";

type ButtonProps = {
  color:
  | "black"
  | "white"
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "info";
  size: "small" | "medium" | "large";
  border?: boolean;
  rounded?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  icon?: boolean;
};

export default function Button({
  color,
  size,
  rounded = true,
  border = false,
  icon = false,
  onClick,
  children,
  className = "",
}: ButtonProps) {
  const baseClasses = `${rounded ? "rounded-full" : ""} ${border ? "border" : ""} ${className}`;

  const sizeClasses = {
    small: `text-xs ${!icon ? "py-2 px-3" : "p-2"}`,
    medium: `text-md ${!icon ? "py-2 px-4" : "p-2"}`,
    large: `text-lg ${!icon ? "py-2 px-4" : "p-2"}`,
  }[size];

  const colorClasses = {
    black: "bg-black text-white",
    white: "bg-white text-black border",
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-500 text-white border",
    danger: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
  }[color];

  const iconClasses = icon ? "flex items-center justify-center" : "";

  const combinedClasses = `${baseClasses} ${colorClasses} ${sizeClasses} ${iconClasses}`;

  return (
    <button className={combinedClasses} onClick={onClick}>
      {children}
    </button>
  );
}
