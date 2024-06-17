import React, { useEffect, useState } from "react";

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
  children: React.ReactNode;
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
  className,
}: ButtonProps) {
  const _base = `${rounded ? "rounded-full" : ""} ${
    border ? "border" : ""
  } ${className}`;

  const _size = {
    small: `text-xs ${!icon ? "py-2 px-3" : "p-2"}`,
    medium: `text-md ${!icon ? "py-2 px-4" : "p-2"}`,
    large: `text-lg  ${!icon ? "py-2 px-4" : "p-2"}`,
  }[size];

  const _color = {
    black: `bg-black text-white`,
    white: `bg-white text-black border`,
    primary: `bg-black text-white`,
    secondary: `bg-white text-wtite border`,
    danger: `bg-red-500 text-white`,
    warning: `bg-yellow-500 text-white`,
    info: `bg-blue-500 text-white`,
  }[color];

  const _icon = icon && "flex items-center justify-center";

  const _class = `${_base} ${_color} ${_size} ${_icon}`;

  return (
    <button className={_class} onClick={onClick}>
      {children}
    </button>
  );
}
